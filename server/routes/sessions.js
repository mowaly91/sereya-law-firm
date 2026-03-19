const express = require('express');
const { dbAsync } = require('../db');
const { logAuditEvents } = require('../services/auditService');
const { validateFields } = require('../validators/validate');

const router = express.Router();

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

const ALLOWED_SESSION_FIELDS = [
    'caseId', 'date', 'sessionType', 'decisionResult', 'nextSessionDate', 
    'status', 'closureReason', 'notes', 'attachments'
];

const REQUIRED_SESSION_FIELDS = ['caseId', 'date'];

const parseArrays = (item) => {
    try { if (item.attachments) item.attachments = JSON.parse(item.attachments); } catch (e) { }
    return item;
};

const stringifyArrays = (dbData) => {
    if (dbData.attachments) dbData.attachments = JSON.stringify(dbData.attachments);
    return dbData;
};

router.get('/', async (req, res) => {
    try {
        const items = await dbAsync.all(`SELECT * FROM sessions WHERE _deleted = 0`);
        const mappedItems = items.map(parseArrays);
        res.json(mappedItems);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const item = await dbAsync.get(`SELECT * FROM sessions WHERE id = ? AND _deleted = 0`, [req.params.id]);
        if (!item) return res.status(404).json({ error: 'Not found' });
        res.json(parseArrays(item));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/', async (req, res) => {
    try {
        const data = validateFields(req.body, ALLOWED_SESSION_FIELDS, REQUIRED_SESSION_FIELDS);
        
        // Date validation logic
        if (isNaN(Date.parse(data.date))) {
            return res.status(400).json({ error: 'تاريخ الجلسة غير صالح' });
        }
        if (data.nextSessionDate && isNaN(Date.parse(data.nextSessionDate))) {
            return res.status(400).json({ error: 'تاريخ الجلسة القادمة غير صالح' });
        }
        if (data.nextSessionDate && new Date(data.nextSessionDate) <= new Date(data.date)) {
            return res.status(400).json({ error: 'تاريخ الجلسة القادمة يجب أن يكون بعد تاريخ الجلسة الحالية' });
        }

        // Status & Outcome enforcement
        if (data.status === 'مغلق' && !data.decisionResult && !data.closureReason) {
             return res.status(400).json({ error: 'يجب توفير سبب الإغلاق أو نتيجة القرار عند إغلاق الجلسة' });
        }

        // Follow up enforcement if decision suggests delay or next step
        if (data.decisionResult && data.decisionResult.includes('تأجيل') && !data.nextSessionDate) {
             return res.status(400).json({ error: 'يجب تحديد تاريخ الجلسة القادمة في حال التأجيل' });
        }

        data.id = generateId();
        const now = new Date().toISOString();
        data._createdAt = now;
        data._updatedAt = now;
        data._deleted = 0;

        const dbData = stringifyArrays({ ...data });

        const fields = Object.keys(dbData);
        const values = Object.values(dbData);
        const placeholders = fields.map(() => '?').join(', ');

        await dbAsync.run(
            `INSERT INTO sessions (${fields.join(', ')}) VALUES (${placeholders})`,
            values
        );

        await logAuditEvents(req.user.id, 'CREATE_SESSION', 'sessions', data.id, { caseId: data.caseId, date: data.date });

        res.status(201).json(data);
    } catch (error) {
        console.error(error);
        if (error.message.includes('حقول غير معروفة') || error.message.includes('مطلوبة')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Server error saving data.' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const data = validateFields(req.body, ALLOWED_SESSION_FIELDS, []);
        if (Object.keys(data).length === 0) return res.status(400).json({ error: 'No data to update' });

        const oldSession = await dbAsync.get(`SELECT * FROM sessions WHERE id = ? AND _deleted = 0`, [id]);
        if (!oldSession) return res.status(404).json({ error: 'Not found' });

        // Logic merging old and new for validation
        const status = data.status !== undefined ? data.status : oldSession.status;
        const decisionResult = data.decisionResult !== undefined ? data.decisionResult : oldSession.decisionResult;
        const closureReason = data.closureReason !== undefined ? data.closureReason : oldSession.closureReason;
        const nextSessionDate = data.nextSessionDate !== undefined ? data.nextSessionDate : oldSession.nextSessionDate;
        const date = data.date !== undefined ? data.date : oldSession.date;

        if (status === 'مغلق' && !decisionResult && !closureReason) {
             return res.status(400).json({ error: 'يجب توفير سبب الإغلاق أو نتيجة القرار عند إغلاق الجلسة' });
        }
        if (decisionResult && decisionResult.includes('تأجيل') && !nextSessionDate) {
             return res.status(400).json({ error: 'يجب تحديد تاريخ الجلسة القادمة في حال التأجيل' });
        }
        if (nextSessionDate && new Date(nextSessionDate) <= new Date(date)) {
            return res.status(400).json({ error: 'تاريخ الجلسة القادمة يجب أن يكون بعد تاريخ الجلسة الحالية' });
        }

        const now = new Date().toISOString();
        const dbData = stringifyArrays({ ...data });
        
        let assignments = [];
        let params = [];
        let auditDetails = {};
        
        // Track outcome explicitly
        let outcomeChanged = false;

        for (const [k, v] of Object.entries(dbData)) {
            assignments.push(`"${k}" = ?`);
            params.push(v);
            if (oldSession[k] !== v) {
                auditDetails[k] = v;
                if (k === 'decisionResult' || k === 'status' || k === 'closureReason') {
                    outcomeChanged = true;
                }
            }
        }

        if (assignments.length > 0) {
            assignments.push(`"_updatedAt" = ?`);
            params.push(now);

            await dbAsync.run(
                `UPDATE sessions SET ${assignments.join(', ')} WHERE id = ?`,
                [...params, id]
            );

            if (outcomeChanged) {
                await logAuditEvents(req.user.id, 'SESSION_OUTCOME', 'sessions', id, {
                    oldStatus: oldSession.status, newStatus: status,
                    decisionResult, closureReason
                });
            } else if (Object.keys(auditDetails).length > 0) {
                await logAuditEvents(req.user.id, 'UPDATE_SESSION', 'sessions', id, auditDetails);
            }
        }

        const updatedItem = await dbAsync.get(`SELECT * FROM sessions WHERE id = ?`, [id]);
        res.json({ newItem: parseArrays(updatedItem) });
    } catch (error) {
        console.error(error);
        if (error.message.includes('حقول غير معروفة')) return res.status(400).json({ error: error.message });
        res.status(500).json({ error: 'Server error' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await dbAsync.run(
            `UPDATE sessions SET _deleted = 1, "_updatedAt" = ? WHERE id = ?`,
            [new Date().toISOString(), id]
        );
        await logAuditEvents(req.user.id, 'DELETE_SESSION', 'sessions', id, { reason: 'soft delete' });
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
