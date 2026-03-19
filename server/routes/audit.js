const express = require('express');
const { dbAsync } = require('../db');
const { requireSuperAdmin } = require('../middleware/auth');

const router = express.Router();

// Enforce requireSuperAdmin is actually applied in server.js when mounting this router,
// but we add it here explicitly for safety as well.
router.get('/', requireSuperAdmin, async (req, res) => {
    try {
        const rows = await dbAsync.all(`SELECT * FROM audit_logs ORDER BY id DESC LIMIT 500`);

        const mapped = rows.map(r => {
            const parsed = { ...r };
            try { if (parsed.details) parsed.details = JSON.parse(parsed.details); } catch(e) {}
            return parsed;
        });
        res.json(mapped);
    } catch (err) {
        console.error('Audit Fetch Error:', err);
        res.status(500).json({ error: 'خطأ في جلب سجلات التدقيق' });
    }
});

router.get('/:id', requireSuperAdmin, async (req, res) => {
    try {
        const row = await dbAsync.get(`SELECT * FROM audit_logs WHERE id = ?`, [req.params.id]);
        if (!row) return res.status(404).json({ error: 'لم يتم العثور على السجل' });
        
        const parsed = { ...row };
        try { if (parsed.details) parsed.details = JSON.parse(parsed.details); } catch(e) {}
        
        res.json(parsed);
    } catch (err) {
        console.error('Audit Fetch Error:', err);
        res.status(500).json({ error: 'خطأ في جلب سجل التدقيق' });
    }
});

// Explicitly reject mutations
const rejectCb = (req, res) => res.status(405).json({ error: 'سجلات التدقيق للقراءة فقط ولا يمكن التعديل عليها' });
router.post('/', rejectCb);
router.put('/:id', rejectCb);
router.delete('/:id', rejectCb);

module.exports = router;
