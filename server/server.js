const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { db, dbAsync } = require('./db');
const { generateCrudRoutes } = require('./routes/crudRouteFactory');
const authRouter = require('./routes/auth');
const { authMiddleware } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Main Entry Router Validation
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running' });
});

// Drive PDF Scanner & Sync
const { scanDriveFolderForClients, syncDriveClient } = require('./drivePdfService');

app.get('/api/scan-drive-pdfs', async (req, res) => {
    try {
        const folderId = req.query.folderId;
        if (!folderId) {
            return res.status(400).json({ error: 'folderId query parameter is required' });
        }
        const extractedClients = await scanDriveFolderForClients(folderId);
        res.json({ success: true, clients: extractedClients });
    } catch (err) {
        console.error('Scan Error:', err);
        res.status(500).json({ error: err.message, stack: err.stack });
    }
});

app.get('/api/sync-drive', async (req, res) => {
    try {
        const folderId = req.query.folderId;
        if (!folderId) {
            return res.status(400).json({ error: 'folderId query parameter is required' });
        }
        const extractedId = await syncDriveClient(folderId);
        res.json({ success: true, nationalId: extractedId });
    } catch (err) {
        console.error('Sync Error:', err);
        res.status(500).json({ error: err.message, stack: err.stack });
    }
});

// Settings API (Key-Value)
app.get('/api/settings', async (req, res) => {
    try {
        const rows = await dbAsync.all(`SELECT * FROM settings`);
        const settings = {};
        rows.forEach(row => {
            settings[row.key] = row.value;
        });
        res.json(settings);
    } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/settings', async (req, res) => {
    try {
        const { key, value } = req.body;
        await dbAsync.run(`INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`, [key, value]);
        res.json({ success: true, key, value });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Public: Auth routes (no JWT required)
app.use('/api/auth', authRouter);

// Mount CRUD routes (all protected by JWT)
app.use('/api/users', authMiddleware, generateCrudRoutes('users'));
app.use('/api/clients', authMiddleware, generateCrudRoutes('clients'));
app.use('/api/cases', authMiddleware, generateCrudRoutes('cases'));
app.use('/api/sessions', authMiddleware, generateCrudRoutes('sessions'));
app.use('/api/actions', authMiddleware, generateCrudRoutes('actions'));
app.use('/api/deadlines', authMiddleware, generateCrudRoutes('deadlines'));
app.use('/api/lookups', authMiddleware, generateCrudRoutes('lookup_mappings'));
app.use('/api/audit', authMiddleware, generateCrudRoutes('audit_logs'));

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
