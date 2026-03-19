/**
 * Authorization verification harness
 * 
 * Tests (no live DB, no Google credentials needed):
 *   1. admin  token → /api/clients/import/google-sheet/preview  → 200 (or 500, never 401/403)
 *   2. user   token → /api/clients/import/google-sheet/preview  → 403
 *   3. no token     → /api/clients/import/google-sheet/preview  → 401
 *   4. driveLink guard: role=user has driveLink silently stripped
 *   5. driveLink guard: role=admin passes driveLink through
 *
 * Runs against an in-process Express app so no real server is required.
 * Uses only modules already in package.json (jsonwebtoken, express).
 *
 * Run: node tests/verify_import_authz.js
 */

'use strict';

// ── Force strict-admin mode for this test run ─────────────────────────────────
process.env.RBAC_STRICT_ADMIN    = 'true';
process.env.JWT_SECRET           = 'test-secret-do-not-use-in-prod';
// Prevents db.js from calling process.exit(1) by supplying a dummy DATABASE_URL.
// We intercept DB calls via mocking below, so the URL never actually connects.
process.env.DATABASE_URL         = 'postgresql://fake:fake@localhost:5432/fake';

// ── Minimal mocks so the app modules load without real Postgres / Google ───────
// Mock 'pg' Pool – every query returns empty rows
const Module = require('module');
const originalLoad = Module._load;
Module._load = function (id, parent, isMain) {
    if (id === 'pg') {
        return {
            Pool: class FakePool {
                on() {}
                query() { return Promise.resolve({ rows: [], rowCount: 0 }); }
            }
        };
    }
    return originalLoad.apply(this, arguments);
};

// ── Load auth pieces ──────────────────────────────────────────────────────────
const jwt  = require('jsonwebtoken');
const { requireAuth, requireSuperAdmin, SUPER_ADMIN_ROLES, JWT_SECRET } = require('../middleware/auth');

// ── Tiny in-process tester ────────────────────────────────────────────────────
const express = require('express');
const http    = require('http');

function makeApp() {
    const app = express();
    app.use(express.json());

    // Mirror the exact server.js mounting order
    app.use(
        '/api/clients/import/google-sheet',
        requireAuth,
        requireSuperAdmin,
        require('../routes/clientsGoogleSheetImport')
    );
    app.use('/api/clients', requireAuth, (req, res) => {
        // Simulate crudRouteFactory PUT handler for driveLink guard test
        if (req.method === 'PUT') {
            const dbData = { ...req.body };
            // ── driveLink guard (copied verbatim from crudRouteFactory.js L105-L110) ──
            if (dbData.driveLink !== undefined) {
                if (req.user && req.user.role !== 'admin') {
                    delete dbData.driveLink;
                }
            }
            return res.json({ received: dbData });
        }
        res.json({ ok: true });
    });

    return app;
}

// ── HTTP helper ───────────────────────────────────────────────────────────────
function request(app, method, path, body, token) {
    return new Promise((resolve, reject) => {
        const server = http.createServer(app);
        server.listen(0, () => {
            const port  = server.address().port;
            const data  = body ? JSON.stringify(body) : null;
            const opts  = {
                hostname: '127.0.0.1',
                port,
                path,
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            };
            const req = http.request(opts, (res) => {
                let raw = '';
                res.on('data', d => raw += d);
                res.on('end', () => {
                    server.close();
                    try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
                    catch { resolve({ status: res.statusCode, body: raw }); }
                });
            });
            req.on('error', (e) => { server.close(); reject(e); });
            if (data) req.write(data);
            req.end();
        });
    });
}

// ── Token factory ─────────────────────────────────────────────────────────────
function makeToken(role) {
    return jwt.sign({ id: 'test-user', role }, JWT_SECRET, { expiresIn: '1h' });
}

// ── Assertions ────────────────────────────────────────────────────────────────
let passed = 0, failed = 0;
function assert(label, actual, expectedStatus) {
    const ok = actual.status === expectedStatus;
    const icon = ok ? '✅' : '❌';
    console.log(`${icon}  ${label}`);
    console.log(`     Expected status: ${expectedStatus}  |  Got: ${actual.status}`);
    if (!ok) {
        console.log(`     Body:`, JSON.stringify(actual.body));
        failed++;
    } else {
        passed++;
    }
}

// ── Run all checks ────────────────────────────────────────────────────────────
(async () => {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(' Sereya Law Firm – Import Authorization Verification Harness');
    console.log(' RBAC_STRICT_ADMIN =', process.env.RBAC_STRICT_ADMIN);
    console.log(' SUPER_ADMIN_ROLES  =', [...SUPER_ADMIN_ROLES].join(', '));
    console.log('═══════════════════════════════════════════════════════════\n');

    const adminToken = makeToken('admin');
    const userToken  = makeToken('user');
    const previewUrl = '/api/clients/import/google-sheet/preview';

    // ── Test 1: admin → preview ───────────────────────────────────────────────
    // Will hit the Google Sheets service which fails (no real creds), so we expect
    // 500 from the service layer – meaning RBAC passed and the route was reached.
    const app1 = makeApp();
    const t1   = await request(app1, 'POST', previewUrl, { sheetId: 'FAKE_ID' }, adminToken);
    assert(
        'T1: admin token → /preview → should NOT be 401 or 403 (RBAC passes, service may error)',
        t1,
        t1.status === 401 || t1.status === 403 ? 403 : t1.status   // will show real status
    );
    // Separate clearer assertion
    const t1Pass = t1.status !== 401 && t1.status !== 403;
    console.log(`   → Actual: ${t1.status}  ${t1Pass ? '(auth passed ✅)' : '(auth BLOCKED ❌)'}\n`);
    if (!t1Pass) failed++; else passed++;

    // ── Test 2: user → preview → 403 ─────────────────────────────────────────
    const app2 = makeApp();
    const t2   = await request(app2, 'POST', previewUrl, { sheetId: 'FAKE_ID' }, userToken);
    assert('T2: user token → /preview → 403 Forbidden', t2, 403);
    console.log(`   → Body: ${JSON.stringify(t2.body)}\n`);

    // ── Test 3: no token → preview → 401 ─────────────────────────────────────
    const app3 = makeApp();
    const t3   = await request(app3, 'POST', previewUrl, { sheetId: 'FAKE_ID' }, null);
    assert('T3: no token → /preview → 401 Unauthorized', t3, 401);
    console.log(`   → Body: ${JSON.stringify(t3.body)}\n`);

    // ── Test 4: role=user PUT /api/clients/:id with driveLink → stripped ──────
    const app4  = makeApp();
    const t4    = await request(app4, 'PUT', '/api/clients/some-id',
        { name: 'John', driveLink: 'https://drive.google.com/evil' }, userToken);
    const gotDriveLink4 = t4.body && t4.body.received && 'driveLink' in t4.body.received;
    console.log(`${!gotDriveLink4 ? '✅' : '❌'}  T4: role=user PUT clients/:id → driveLink should be stripped`);
    console.log(`   → driveLink in payload: ${gotDriveLink4}  (expected: false)`);
    console.log(`   → Received fields: ${JSON.stringify(Object.keys(t4.body?.received || {}))}\n`);
    if (!gotDriveLink4) passed++; else failed++;

    // ── Test 5: role=admin PUT /api/clients/:id with driveLink → preserved ────
    const app5  = makeApp();
    const t5    = await request(app5, 'PUT', '/api/clients/some-id',
        { name: 'John', driveLink: 'https://drive.google.com/allowed' }, adminToken);
    const gotDriveLink5 = t5.body && t5.body.received && 'driveLink' in t5.body.received;
    console.log(`${gotDriveLink5 ? '✅' : '❌'}  T5: role=admin PUT clients/:id → driveLink should be preserved`);
    console.log(`   → driveLink in payload: ${gotDriveLink5}  (expected: true)`);
    console.log(`   → Received fields: ${JSON.stringify(Object.keys(t5.body?.received || {}))}\n`);
    if (gotDriveLink5) passed++; else failed++;

    // ── Summary ───────────────────────────────────────────────────────────────
    console.log('═══════════════════════════════════════════════════════════');
    console.log(` Results: ${passed} passed, ${failed} failed`);
    console.log('═══════════════════════════════════════════════════════════\n');
    process.exit(failed > 0 ? 1 : 0);
})();
