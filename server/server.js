const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { db, dbAsync } = require('./db');
const { generateCrudRoutes } = require('./routes/crudRouteFactory');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Main Entry Router Validation
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running' });
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

// Mount CRUD routes
app.use('/api/users', generateCrudRoutes('users'));
app.use('/api/clients', generateCrudRoutes('clients'));
app.use('/api/cases', generateCrudRoutes('cases'));
app.use('/api/sessions', generateCrudRoutes('sessions'));
app.use('/api/actions', generateCrudRoutes('actions'));
app.use('/api/deadlines', generateCrudRoutes('deadlines'));
app.use('/api/lookups', generateCrudRoutes('lookup_mappings'));
app.use('/api/audit', generateCrudRoutes('audit_logs'));

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
