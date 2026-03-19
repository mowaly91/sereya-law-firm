const express = require('express');
const { dbAsync } = require('../db');
const { logAuditEvents } = require('../services/auditService');
const { validateFields } = require('../validators/validate');

const router = express.Router();

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

const ALLOWED_DEADLINE_FIELDS = [
    'caseId', 'deadlineType', 'startDate', 'endDate', 
    'responsibleUserId', 'status', 'completionNote'
];

const REQUIRED_DEADLINE_FIELDS = ['endDate'];
const VALID_DEADLINE_STATUSES = ['قيد الانتظار', 'مكتمل', 'فائت'];

router.get('/', async (req, res) => {
    try {
        const items = await dbAsync.all(`SELECT * FROM deadlines WHERE _deleted = 0`);
        res.json(items);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const item = await dbAsync.get(`SELECT * FROM deadlines WHERE id = ? AND _deleted = 0`, [req.params.id]);
        if (!item) return res.status(404).json({ error: 'Not found' });
        res.json(item);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/', async (req, res) => {
    try {
        const data = validateFields(req.body, ALLOWED_DEADLINE_FIELDS, REQUIRED_DEADLINE_FIELDS);
        
        // Date validation logic
        if (isNaN(Date.parse(data.endDate))) {
            return res.status(400).json({ error: 'تاريخ الاستحقاق غير صالح' });
        }
        if (data.startDate && isNaN(Date.parse(data.startDate))) {
            return res.status(400).json({ error: 'تاريخ البدء غير صالح' });
        }
        if (data.startDate && new Date(data.endDate) < new Date(data.startDate)) {
            return res.status(400).json({ error: 'تاريخ الاستحقاق يجب أن يكون بعد تاريخ البدء' });
        }

        if (data.status && !VALID_DEADLINE_STATUSES.includes(data.status)) {
            // Depending on frontend
            // return res.status(400).json({ error: 'حالة الموعد غير صالحة' });
        }
        
        if (!data.status) data.status = 'قيد الانتظار';

        data.id = generateId();
        const now = new Date().toISOString();
        data._createdAt = now;
        data._updatedAt = now;
        data._deleted = 0;

        const dbData = { ...data };
        const fields = Object.keys(dbData);
        const values = Object.values(dbData);
        const placeholders = fields.map(() => '?').join(', ');

        await dbAsync.run(
            `INSERT INTO deadlines (${fields.join(', ')}) VALUES (${placeholders})`,
            values
        );

        await logAuditEvents(req.user.id, 'CREATE_DEADLINE', 'deadlines', data.id, { 
            caseId: data.caseId, 
            endDate: data.endDate 
        });

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
        const data = validateFields(req.body, ALLOWED_DEADLINE_FIELDS, []);
        if (Object.keys(data).length === 0) return res.status(400).json({ error: 'No data to update' });

        const oldDeadline = await dbAsync.get(`SELECT * FROM deadlines WHERE id = ? AND _deleted = 0`, [id]);
        if (!oldDeadline) return res.status(404).json({ error: 'Not found' });

        const status = data.status !== undefined ? data.status : oldDeadline.status;
        const endDate = data.endDate !== undefined ? data.endDate : oldDeadline.endDate;
        const startDate = data.startDate !== undefined ? data.startDate : oldDeadline.startDate;

        if (data.endDate && isNaN(Date.parse(data.endDate))) return res.status(400).json({ error: 'تاريخ الاستحقاق غير صالح' });
        if (data.startDate && isNaN(Date.parse(data.startDate))) return res.status(400).json({ error: 'تاريخ البدء غير صالح' });
        if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
             return res.status(400).json({ error: 'تاريخ الاستحقاق يجب أن يكون بعد تاريخ البدء' });
        }

        // Enforce transitions: reopen rules
        if (oldDeadline.status !== 'قيد الانتظار' && status === 'قيد الانتظار') {
            if (oldDeadline.status !== 'مكتمل' && oldDeadline.status !== 'فائت') {
                 return res.status(400).json({ error: 'لا يمكن إعادة فتح موعد إلا إذا كان مكتمل أو فائت' });
            }
        }
        // Force completion note if complete?
        if (status === 'مكتمل' && oldDeadline.status !== 'مكتمل' && !data.completionNote && !oldDeadline.completionNote) {
             // Maybe optional, but good for follow-up rules.
             // return res.status(400).json({ error: 'يجب توفير ملاحظات عند إكمال الموعد' });
        }

        const now = new Date().toISOString();
        const dbData = { ...data };
        
        let assignments = [];
        let params = [];
        let auditDetails = {};
        
        let auditAction = 'UPDATE_DEADLINE';

        if (status === 'مكتمل' && oldDeadline.status !== 'مكتمل') auditAction = 'COMPLETE_DEADLINE';
        else if (status === 'فائت' && oldDeadline.status !== 'فائت') auditAction = 'MISS_DEADLINE';
        else if (status === 'قيد الانتظار' && (oldDeadline.status === 'مكتمل' || oldDeadline.status === 'فائت')) auditAction = 'REOPEN_DEADLINE';

        for (const [k, v] of Object.entries(dbData)) {
            assignments.push(`"${k}" = ?`);
            params.push(v);
            if (oldDeadline[k] !== v) {
                auditDetails[k] = v;
            }
        }

        if (assignments.length > 0) {
            assignments.push(`"_updatedAt" = ?`);
            params.push(now);

            await dbAsync.run(
                `UPDATE deadlines SET ${assignments.join(', ')} WHERE id = ?`,
                [...params, id]
            );

            if (Object.keys(auditDetails).length > 0) {
                 await logAuditEvents(req.user.id, auditAction, 'deadlines', id, auditDetails);
            }
        }

        const updatedItem = await dbAsync.get(`SELECT * FROM deadlines WHERE id = ?`, [id]);
        res.json({ newItem: updatedItem });
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
            `UPDATE deadlines SET _deleted = 1, "_updatedAt" = ? WHERE id = ?`,
            [new Date().toISOString(), id]
        );
        await logAuditEvents(req.user.id, 'DELETE_DEADLINE', 'deadlines', id, { reason: 'soft delete' });
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
