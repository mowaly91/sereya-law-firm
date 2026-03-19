const express = require('express');
const router = express.Router();
const googleSheetsImportService = require('../services/googleSheetsImportService');

router.post('/preview', async (req, res) => {
    try {
        const { sheetUrl, sheetId, tabName, range } = req.body;
        const target = sheetUrl || sheetId;
        if (!target) {
            return res.status(400).json({ error: 'sheetUrl or sheetId is required' });
        }
        const result = await googleSheetsImportService.previewSheet(target, tabName, range);
        res.json(result);
    } catch (error) {
        console.error('Google Sheet Preview Error:', error);
        res.status(500).json({ error: error.message || 'Error occurred while fetching or processing Google Sheet' });
    }
});

router.post('/commit', async (req, res) => {
    try {
        const { rows, mode } = req.body;
        if (!rows || !Array.isArray(rows)) {
            return res.status(400).json({ error: 'rows array is required' });
        }
        if (!mode) {
            return res.status(400).json({ error: 'mode is required (e.g. "upsert")' });
        }
        const userId = req.user.id; // requireAuth sets req.user
        const result = await googleSheetsImportService.commitData({ rows, mode }, userId);
        
        if (result.errors && result.errors.length > 0) {
            // Some entries failed. If all failed, maybe return 409?
            // Usually return 207 Multi-Status or 409 if strictly requested by prompt for single conflicts.
            // Prompt says: "Handle unique constraint errors with 409 (not 500)"
            const isAllConflict = result.errors.every(e => e.error.includes('تعارض فريد'));
            const isMixed = result.errors.length > 0;
            // Returning 207 or keeping 200 with structured errors is better for batch.
            if (isAllConflict && result.created === 0 && result.updated === 0) {
                return res.status(409).json(result);
            }
        }
        
        res.json(result);
    } catch (error) {
        console.error('Google Sheet Commit Error:', error);
        res.status(500).json({ error: 'Error occurred during commit' });
    }
});

module.exports = router;
