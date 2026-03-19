const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { dbAsync } = require('./db');
const { generateCrudRoutes } = require('./routes/crudRouteFactory');
const authRouter = require('./routes/auth');
const { requireAuth, requireSuperAdmin } = require('./middleware/auth');

// ── Production fail-fast startup validation ───────────────────────────────────
// Runs before any route or listener is registered.
// Error messages are intentionally informative but never print secret values.
(function validateProductionEnv() {
    if (process.env.NODE_ENV !== 'production') return;

    const missing = [];

    if (!process.env.DATABASE_URL)
        missing.push('DATABASE_URL            (required: PostgreSQL connection string)');

    if (!process.env.JWT_SECRET)
        missing.push('JWT_SECRET              (required: random secret ≥ 32 chars for signing JWTs)');

    if (missing.length) {
        console.error('\n[STARTUP] ❌ Missing required environment variables in production:');
        missing.forEach(v => console.error('  •', v));
        console.error('[STARTUP] Set these variables in your deployment environment and restart.\n');
        process.exit(1);
    }

    // Google Sheets creds: warn but don't block startup.
    // The import endpoint will return a runtime error if creds are absent.
    const sheetsCredsPresent =
        process.env.GOOGLE_SHEETS_CREDENTIALS ||
        process.env.GOOGLE_CREDENTIALS;
    if (!sheetsCredsPresent) {
        console.warn(
            '[STARTUP] ⚠️  GOOGLE_SHEETS_CREDENTIALS / GOOGLE_CREDENTIALS not set.' +
            ' The /api/clients/import/google-sheet endpoints will fail at runtime.'
        );
    }

    console.log('[STARTUP] ✅ Production environment validated.');
}());

const app = express();
const PORT = process.env.PORT || 3000;

// ── CORS – restrict to configured frontend origin(s) ──────────────────────────
// Set FRONTEND_URL (comma-separated) in .env. Falls back to localhost:5173 for dev.
const rawOrigins = process.env.FRONTEND_URL || 'http://localhost:5173';
const allowedOrigins = rawOrigins.split(',').map(o => o.trim()).filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (curl, server-to-server, health checks)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error(`CORS: origin "${origin}" not allowed`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

app.use(express.json());


// ── Health check (public) ─────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', message: 'Backend is running' });
});

// ── Drive PDF Scanner & Sync (protected: auth + super-admin) ─────────────────
const FEATURE_DRIVE_OCR = process.env.FEATURE_DRIVE_OCR === 'true';

const driveOcrGuard = (req, res, next) => {
    if (!FEATURE_DRIVE_OCR) {
        return res.status(404).json({ error: "Not found" });
    }
    next();
};

const driveService = FEATURE_DRIVE_OCR ? require('./drivePdfService') : null;

app.get('/api/scan-drive-pdfs', driveOcrGuard, requireAuth, requireSuperAdmin, async (req, res) => {
    try {
        const folderId = req.query.folderId;
        if (!folderId) {
            return res.status(400).json({ error: 'folderId query parameter is required' });
        }
        const extractedClients = await driveService.scanDriveFolderForClients(folderId);
        res.json({ success: true, clients: extractedClients });
    } catch (err) {
        console.error('Scan Error:', err);
        res.status(500).json({ error: 'خطأ أثناء فحص Drive' });
    }
});

app.get('/api/sync-drive', driveOcrGuard, requireAuth, requireSuperAdmin, async (req, res) => {
    try {
        const folderId = req.query.folderId;
        if (!folderId) {
            return res.status(400).json({ error: 'folderId query parameter is required' });
        }
        const extractedId = await driveService.syncDriveClient(folderId);
        res.json({ success: true, nationalId: extractedId });
    } catch (err) {
        console.error('Sync Error:', err);
        res.status(500).json({ error: 'خطأ أثناء مزامنة Drive' });
    }
});

// ── Settings API (protected: auth + super-admin) ──────────────────────────────
app.get('/api/settings', requireAuth, requireSuperAdmin, async (req, res) => {
    try {
        const rows = await dbAsync.all(`SELECT * FROM settings`);
        const settings = {};
        rows.forEach(row => { settings[row.key] = row.value; });
        res.json(settings);
    } catch (err) {
        console.error('Settings GET error:', err);
        res.status(500).json({ error: 'خطأ في جلب الإعدادات' });
    }
});

app.post('/api/settings', requireAuth, requireSuperAdmin, async (req, res) => {
    try {
        const { key, value } = req.body;
        await dbAsync.run(
            `INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
            [key, value]
        );
        res.json({ success: true, key, value });
    } catch (err) {
        console.error('Settings POST error:', err);
        res.status(500).json({ error: 'خطأ في حفظ الإعدادات' });
    }
});

// ── Auth routes (public – JWT not required for login/set-password) ────────────
app.use('/api/auth', authRouter);

// ── Domain Specific Routes (protected by JWT + specific rules) ─────────────────
app.use('/api/users',     requireAuth, require('./routes/users'));
app.use('/api/cases',     requireAuth, require('./routes/cases'));
app.use('/api/sessions',  requireAuth, require('./routes/sessions'));
app.use('/api/deadlines', requireAuth, require('./routes/deadlines'));

// ── Shared Standard CRUD routes (protected by JWT) ────────────────────────────
app.use('/api/clients/import/google-sheet', requireAuth, requireSuperAdmin, require('./routes/clientsGoogleSheetImport'));
app.use('/api/clients',   requireAuth, generateCrudRoutes('clients'));
app.use('/api/actions',   requireAuth, generateCrudRoutes('actions'));
app.use('/api/lookups',   requireAuth, generateCrudRoutes('lookup_mappings'));

// ── Audit logs (read-only GET, super-admin only) ──────────────────────────────
app.use('/api/audit', requireAuth, require('./routes/audit'));

// ── Serve built frontend static files ────────────────────────────────────────
const path = require('path');
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// SPA fallback – serve index.html for all non-API routes
app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

// ── Global error handler – catch any next(err) and never leak stack traces ────
// Must be registered AFTER all routes.
app.use((err, req, res, _next) => { // eslint-disable-line no-unused-vars
    const isDev = process.env.NODE_ENV !== 'production';
    console.error('[Unhandled error]', err);
    res.status(err.status || 500).json({
        error: isDev ? err.message : 'خطأ داخلي في الخادم',
    });
});

// ── Start server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

