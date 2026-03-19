/**
 * appFactory.js
 *
 * Creates and returns a fully-configured Express app with the real routing
 * logic but with `db.js` mocked so no real PostgreSQL connection is needed.
 *
 * Call `makeApp(dbStubs, envOverrides)` from each test suite.
 *
 * @param {object} dbStubs   - { get, all, run } async stubs (default: sensible no-op stubs)
 * @param {object} env       - extra env vars to overlay for this test run
 * @returns {import('express').Application}
 */

'use strict';

const Module = require('module');
const path   = require('path');

// Resolve the canonical absolute path that `require('../db')` would load.
// All modules inside /server use the same resolved key so the mock is shared.
const DB_MODULE_ID     = path.resolve(__dirname, '../../db.js');
const SHEETS_MODULE_ID = (() => {
    try { return require.resolve(path.resolve(__dirname, '../../services/googleSheetsImportService.js')); }
    catch (_) { return null; }
})();

/** Default Google Sheets service stub – returns an empty preview response */
const DEFAULT_SHEETS_STUBS = {
    previewSheet: async () => ({ validRows: [], invalidRows: [], conflicts: [] }),
    commitData:   async () => ({ created: 0, updated: 0, skipped: 0, errors: [] }),
};

/**
 * Default DB stubs – return empty / null for everything so the app boots
 * without errors and individual tests can override per-test.
 */
const DEFAULT_STUBS = {
    get: async () => null,
    all: async () => [],
    run: async () => ({ changes: 0 }),
};

/**
 * Make a fresh Express application wired up with stubbed DB.
 *
 * env vars are applied to `process.env` before requiring any server module.
 * They are restored automatically after the factory runs so they don't bleed
 * into other tests.  Note: because Node caches modules, call `makeApp` once
 * per test file (or pass different envs carefully).
 */
function makeApp(dbStubs = {}, envOverrides = {}, sheetsStubs = {}) {
    const stubs        = { ...DEFAULT_STUBS, ...dbStubs };
    const sheetsService = { ...DEFAULT_SHEETS_STUBS, ...sheetsStubs };

    // ── 1. Overlay env vars ────────────────────────────────────────────────────
    const originalEnv = {};
    // Required to prevent db.js from calling process.exit(1)
    const defaults = {
        DATABASE_URL: 'postgres://mock:mock@localhost/mock',
        JWT_SECRET:   'test-secret-do-not-use-in-prod',
        NODE_ENV:     'test',
        FEATURE_DRIVE_OCR: 'false',
    };
    const fullEnv = { ...defaults, ...envOverrides };
    for (const [k, v] of Object.entries(fullEnv)) {
        originalEnv[k] = process.env[k];
        process.env[k] = v;
    }

    // ── 2. Inject the db mock via Module._resolveFilename override ─────────────
    // We intercept require() calls for the DB module and return our stub object.
    const originalLoad = Module._load;
    Module._load = function (request, parent, isMain) {
        // Resolve absolute path of the requested module to compare
        let resolved;
        try {
            resolved = Module._resolveFilename(request, parent, isMain);
        } catch (_) {
            resolved = null;
        }
        if (resolved === DB_MODULE_ID) {
            return { db: null, dbAsync: stubs };
        }
        if (SHEETS_MODULE_ID && resolved === SHEETS_MODULE_ID) {
            return sheetsService;
        }
        return originalLoad.apply(this, arguments);
    };

    // ── 3. Clear cached server/route modules so each call gets fresh routes ────
    const serverModules = [
        '../../server.js',
        '../../routes/auth.js',
        '../../routes/audit.js',
        '../../routes/cases.js',
        '../../routes/sessions.js',
        '../../routes/deadlines.js',
        '../../routes/users.js',
        '../../routes/crudRouteFactory.js',
        '../../routes/clientsGoogleSheetImport.js',
        '../../middleware/auth.js',
    ].map(rel => {
        try { return require.resolve(path.resolve(__dirname, rel)); }
        catch (_) { return null; }
    }).filter(Boolean);

    // Also clear db module
    serverModules.push(DB_MODULE_ID);

    // Clear google-sheets service so the mock is picked up fresh
    if (SHEETS_MODULE_ID) serverModules.push(SHEETS_MODULE_ID);

    serverModules.forEach(id => { delete require.cache[id]; });

    // ── 4. Build the app (use inline bootstrap to avoid starting the HTTP server)
    const express    = require('express');
    const cors       = require('cors');
    const { requireAuth, requireSuperAdmin } = require('../../middleware/auth');

    const app = express();
    app.use(cors());
    app.use(express.json());

    // Health
    app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

    // Drive OCR feature flag
    const FEATURE_DRIVE_OCR = process.env.FEATURE_DRIVE_OCR === 'true';
    const driveOcrGuard = (req, res, next) =>
        FEATURE_DRIVE_OCR ? next() : res.status(404).json({ error: 'Not found' });

    app.get('/api/scan-drive-pdfs', driveOcrGuard, requireAuth, requireSuperAdmin, (_req, res) =>
        res.json({ ok: true }));
    app.get('/api/sync-drive', driveOcrGuard, requireAuth, requireSuperAdmin, (_req, res) =>
        res.json({ ok: true }));

    // Settings
    app.get('/api/settings', requireAuth, requireSuperAdmin, async (_req, res) => {
        try {
            const rows = await stubs.all('SELECT * FROM settings');
            const out = {};
            rows.forEach(r => { out[r.key] = r.value; });
            res.json(out);
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    // Auth
    app.use('/api/auth', require('../../routes/auth'));

    // Domain routes
    app.use('/api/users',     requireAuth, require('../../routes/users'));
    app.use('/api/cases',     requireAuth, require('../../routes/cases'));
    app.use('/api/sessions',  requireAuth, require('../../routes/sessions'));
    app.use('/api/deadlines', requireAuth, require('../../routes/deadlines'));

    // Google Sheet import (requireSuperAdmin applied here, matching server.js)
    const { generateCrudRoutes } = require('../../routes/crudRouteFactory');
    app.use('/api/clients/import/google-sheet', requireAuth, requireSuperAdmin,
        require('../../routes/clientsGoogleSheetImport'));
    app.use('/api/clients', requireAuth, generateCrudRoutes('clients'));

    // Audit
    app.use('/api/audit', requireAuth, require('../../routes/audit'));

    // ── 5. Restore module loader & env vars ────────────────────────────────────
    Module._load = originalLoad;
    for (const [k, v] of Object.entries(originalEnv)) {
        if (v === undefined) delete process.env[k];
        else process.env[k] = v;
    }

    return app;
}

module.exports = { makeApp };
