'use strict';

/**
 * smoke.test.js  –  Sereya Law Firm CI Smoke Suite
 *
 * Runner: node:test  (Node ≥ 18; this project uses v24)
 * HTTP:   supertest
 * DB:     fully mocked via appFactory – no real PostgreSQL needed
 *
 * Run:
 *   npm test                   (inside /server)
 *   node --test tests/smoke.test.js
 */

const { test, describe, before } = require('node:test');
const assert  = require('node:assert/strict');
const request = require('supertest');
const bcrypt  = require('bcryptjs');

const { makeApp }                         = require('./helpers/appFactory');
const { ADMIN_TOKEN, USER_TOKEN, OLD_ADMIN_TOKEN, TEST_SECRET, mintToken } = require('./helpers/jwtHelper');

// ─────────────────────────────────────────────────────────────────────────────
// Shared DB stubs
// ─────────────────────────────────────────────────────────────────────────────

/** A pre-hashed password for the test admin user */
let ADMIN_HASH;

before(async () => {
    ADMIN_HASH = await bcrypt.hash('Admin@test1', 12);
});

/** Build a dbStubs object that returns a valid admin user for login queries */
function loginDbStubs(extra = {}) {
    return {
        get: async (sql, params) => {
            // POST /api/auth/login  → SELECT * FROM users WHERE email = ?
            if (sql.includes('FROM users') && sql.includes('email')) {
                const email = params?.[0];
                if (email === 'admin@test.law') {
                    return {
                        id: 'admin-id-1',
                        email: 'admin@test.law',
                        name: 'Admin User',
                        role: 'admin',
                        active: 1,
                        password_hash: ADMIN_HASH,
                        _deleted: 0,
                    };
                }
                return null; // unknown user
            }
            if (extra.get) return extra.get(sql, params);
            return null;
        },
        all: extra.all || (async () => []),
        run: extra.run || (async () => ({ changes: 1 })),
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Auth — login success / protected route without token
// ─────────────────────────────────────────────────────────────────────────────
describe('Auth', () => {

    test('POST /api/auth/login with valid credentials → 200 + token', async () => {
        const app = makeApp(loginDbStubs());
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@test.law', password: 'Admin@test1' });

        assert.equal(res.status, 200);
        assert.ok(typeof res.body.token === 'string' && res.body.token.length > 10,
            'should return a JWT token string');
        assert.equal(res.body.user.email, 'admin@test.law');
    });

    test('POST /api/auth/login with unknown email → 401', async () => {
        const app = makeApp(loginDbStubs());
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'nobody@nowhere.com', password: 'whatever' });

        assert.equal(res.status, 401);
    });

    test('POST /api/auth/login with wrong password → 401', async () => {
        const app = makeApp(loginDbStubs());
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@test.law', password: 'WrongPass!' });

        assert.equal(res.status, 401);
    });

    test('GET /api/clients without Authorization header → 401', async () => {
        const app = makeApp(); // no db stubs needed; rejected before DB hit
        const res = await request(app).get('/api/clients');
        assert.equal(res.status, 401);
    });

    test('GET /api/audit without Authorization header → 401', async () => {
        const app = makeApp();
        const res = await request(app).get('/api/audit');
        assert.equal(res.status, 401);
    });

    test('GET /api/settings without Authorization header → 401', async () => {
        const app = makeApp();
        const res = await request(app).get('/api/settings');
        assert.equal(res.status, 401);
    });

});

// ─────────────────────────────────────────────────────────────────────────────
// 2. RBAC – strict admin mode
// ─────────────────────────────────────────────────────────────────────────────
describe('RBAC – strict admin (RBAC_STRICT_ADMIN=true)', () => {

    function makeStrictApp(extraDbStubs = {}, sheetsStubs = {}) {
        return makeApp(
            { all: async () => [], run: async () => ({ changes: 0 }), ...extraDbStubs },
            { RBAC_STRICT_ADMIN: 'true' },
            sheetsStubs
        );
    }

    // — admin role gets through —
    test('role=admin  GET /api/audit → 200', async () => {
        const auditDbStubs = {
            all: async (sql) => {
                if (sql.toLowerCase().includes('audit')) return [];
                return [];
            },
            run: async () => ({ changes: 0 }),
        };
        const app = makeStrictApp(auditDbStubs);
        const res = await request(app)
            .get('/api/audit')
            .set('Authorization', `Bearer ${ADMIN_TOKEN}`);

        assert.equal(res.status, 200);
    });

    test('role=admin  POST /api/clients/import/google-sheet/preview → 200 (stubbed service)', async () => {
        // sheetsService is mocked to return a deterministic empty preview – no Google creds needed.
        const previewResult = { validRows: [], invalidRows: [], conflicts: [] };
        const app = makeStrictApp(
            {},   // db stubs (default)
            { previewSheet: async () => previewResult }  // sheets stubs
        );
        const res = await request(app)
            .post('/api/clients/import/google-sheet/preview')
            .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
            .send({ sheetUrl: 'https://docs.google.com/spreadsheets/d/fake' });

        assert.equal(res.status, 200, 'admin preview must return 200 with stubbed service');
        assert.ok('validRows'   in res.body, 'response must have validRows');
        assert.ok('invalidRows' in res.body, 'response must have invalidRows');
        assert.ok('conflicts'   in res.body, 'response must have conflicts');
    });

    test('no token   POST /api/clients/import/google-sheet/preview → 401', async () => {
        const app = makeStrictApp();
        const res = await request(app)
            .post('/api/clients/import/google-sheet/preview')
            .send({ sheetUrl: 'https://docs.google.com/spreadsheets/d/fake' });

        assert.equal(res.status, 401);
    });

    // — user role is denied —
    test('role=user  POST /api/clients/import/google-sheet/preview → 403', async () => {
        const app = makeStrictApp();
        const res = await request(app)
            .post('/api/clients/import/google-sheet/preview')
            .set('Authorization', `Bearer ${USER_TOKEN}`)
            .send({ sheetUrl: 'https://docs.google.com/spreadsheets/d/fake' });

        assert.equal(res.status, 403);
    });

    // — role="Admin" (capital A) is denied in strict mode —
    test('role=Admin (old format) GET /api/audit → 403 when strict', async () => {
        const app = makeStrictApp();
        const res = await request(app)
            .get('/api/audit')
            .set('Authorization', `Bearer ${OLD_ADMIN_TOKEN}`);

        assert.equal(res.status, 403);
    });

    // — non-strict mode still accepts "Admin" (capital A) —
    test('role=Admin (old format) GET /api/audit → 200 when NOT strict', async () => {
        const auditDbStubs = { all: async () => [], run: async () => ({ changes: 0 }) };
        const app = makeApp(auditDbStubs, { RBAC_STRICT_ADMIN: 'false' });
        const res = await request(app)
            .get('/api/audit')
            .set('Authorization', `Bearer ${OLD_ADMIN_TOKEN}`);

        assert.equal(res.status, 200);
    });

});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Drive/OCR feature flag
// ─────────────────────────────────────────────────────────────────────────────
describe('Drive/OCR feature flag', () => {

    test('FEATURE_DRIVE_OCR unset → GET /api/scan-drive-pdfs → 404', async () => {
        // Default in makeApp is FEATURE_DRIVE_OCR=false
        const app  = makeApp();
        const res  = await request(app)
            .get('/api/scan-drive-pdfs')
            .set('Authorization', `Bearer ${ADMIN_TOKEN}`);

        assert.equal(res.status, 404);
    });

    test('FEATURE_DRIVE_OCR=false → GET /api/sync-drive → 404', async () => {
        const app = makeApp({}, { FEATURE_DRIVE_OCR: 'false' });
        const res = await request(app)
            .get('/api/sync-drive')
            .set('Authorization', `Bearer ${ADMIN_TOKEN}`);

        assert.equal(res.status, 404);
    });

    // When flag is true the guard passes; drivePdfService is NOT mocked here
    // so the route reaches requireAuth → requireSuperAdmin. We use a user token
    // to verify 403 (which proves the guard passed and auth middleware fired).
    test('FEATURE_DRIVE_OCR=true → GET /api/scan-drive-pdfs with user token → 403 (guard passed)', async () => {
        const app = makeApp({}, { FEATURE_DRIVE_OCR: 'true' });
        const res = await request(app)
            .get('/api/scan-drive-pdfs')
            .set('Authorization', `Bearer ${USER_TOKEN}`);

        assert.equal(res.status, 403);
    });

    test('FEATURE_DRIVE_OCR=true → GET /api/sync-drive with user token → 403 (guard passed)', async () => {
        const app = makeApp({}, { FEATURE_DRIVE_OCR: 'true' });
        const res = await request(app)
            .get('/api/sync-drive')
            .set('Authorization', `Bearer ${USER_TOKEN}`);

        assert.equal(res.status, 403);
    });

});

// ─────────────────────────────────────────────────────────────────────────────
// 4. driveLink field protection on PUT /api/clients/:id
// ─────────────────────────────────────────────────────────────────────────────
describe('driveLink field protection', () => {

    function makeClientsApp() {
        const db = {
            get:  async (sql, params) => {
                // Return a fake client for SELECT after update
                if (sql.includes('SELECT') && sql.includes('clients')) {
                    return {
                        id: params?.[0] || 'cli-1',
                        name: 'Test Client',
                        driveLink: 'https://drive.google.com/drive/folders/existing',
                        _deleted: 0,
                    };
                }
                return null;
            },
            all:  async () => [],
            run:  async () => ({ changes: 1 }),
        };
        return makeApp(db);
    }

    test('role=user PUT /api/clients/:id with driveLink → driveLink stripped (not 401/403)', async () => {
        const app = makeClientsApp();
        const res = await request(app)
            .put('/api/clients/cli-1')
            .set('Authorization', `Bearer ${USER_TOKEN}`)
            .send({ name: 'Updated Name', driveLink: 'https://drive.google.com/evil-link' });

        // Route should succeed (200) but driveLink must be stripped by crudRouteFactory
        // NOTE: the route returns { newItem: ... } with the stored value (the fake GET above)
        assert.equal(res.status, 200, 'PUT should succeed for regular user');
    });

    test('role=admin PUT /api/clients/:id with driveLink → accepted (200)', async () => {
        const app = makeClientsApp();
        const res = await request(app)
            .put('/api/clients/cli-1')
            .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
            .send({ name: 'Updated Name', driveLink: 'https://drive.google.com/admin-link' });

        assert.equal(res.status, 200, 'admin PUT with driveLink should succeed');
    });

    // Verify that the driveLink is actually present in the run() SQL for admin
    // but absent for user by intercepting the db.run call.
    test('role=user driveLink is stripped from UPDATE SQL', async () => {
        let capturedSql = '';
        const db = {
            run: async (sql, _params) => {
                if (sql.toLowerCase().includes('update')) capturedSql = sql;
                return { changes: 1 };
            },
            get: async () => ({ id: 'cli-1', name: 'Test', driveLink: null, _deleted: 0 }),
            all: async () => [],
        };
        const app = makeApp(db);
        await request(app)
            .put('/api/clients/cli-1')
            .set('Authorization', `Bearer ${USER_TOKEN}`)
            .send({ name: 'No DriveLink', driveLink: 'https://evil.com' });

        assert.ok(!capturedSql.toLowerCase().includes('drivelink'),
            'driveLink column must not appear in the UPDATE query for a regular user');
    });

    test('role=admin driveLink is present in UPDATE SQL', async () => {
        let capturedSql = '';
        const db = {
            run: async (sql, _params) => {
                if (sql.toLowerCase().includes('update')) capturedSql = sql;
                return { changes: 1 };
            },
            get: async () => ({ id: 'cli-1', name: 'Test', driveLink: 'https://ok.com', _deleted: 0 }),
            all: async () => [],
        };
        const app = makeApp(db);
        await request(app)
            .put('/api/clients/cli-1')
            .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
            .send({ name: 'With DriveLink', driveLink: 'https://drive.google.com/ok' });

        assert.ok(capturedSql.toLowerCase().includes('drivelink'),
            'driveLink column must appear in the UPDATE query for admin');
    });

});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Health check (sanity)
// ─────────────────────────────────────────────────────────────────────────────
describe('Health check', () => {

    test('GET /api/health → 200 { status: ok }', async () => {
        const app = makeApp();
        const res = await request(app).get('/api/health');
        assert.equal(res.status, 200);
        assert.equal(res.body.status, 'ok');
    });

});
