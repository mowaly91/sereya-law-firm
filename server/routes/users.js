const express = require('express');
const { dbAsync } = require('../db');
const { requireSuperAdmin } = require('../middleware/auth');
const { validateFields } = require('../validators/validate');
const { logAuditEvents } = require('../services/auditService');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const router = express.Router();

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Allowed fields for create/update
const ALLOWED_USER_FIELDS = ['name', 'role', 'email', 'phone', 'active', 'password'];
const REQUIRED_USER_FIELDS = ['name', 'email', 'role'];

// All roles currently known by the UI or legacy tables
const VALID_ROLES = ['admin', 'مدير النظام', 'شريك', 'محامي مسؤول', 'محامي', 'مستشار', 'إداري', 'متدرب', 'user'];

// Generate CRUD structure
router.get('/', async (req, res) => {
    try {
         // Return basic fields to keep shape, omitting password_hash
        const users = await dbAsync.all(`SELECT id, name, role, email, phone, active, "_createdAt", "_updatedAt" FROM users WHERE _deleted = 0`);
        const mapped = users.map(u => ({ ...u, active: !!u.active }));
        res.json(mapped);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const user = await dbAsync.get(`SELECT id, name, role, email, phone, active, "_createdAt", "_updatedAt" FROM users WHERE id = ? AND _deleted = 0`, [req.params.id]);
        if (!user) return res.status(404).json({ error: 'Not found' });
        user.active = !!user.active;
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/', requireSuperAdmin, async (req, res) => {
    try {
        const data = validateFields(req.body, ALLOWED_USER_FIELDS, REQUIRED_USER_FIELDS);
        
        // Normalize role
        if (data.role === 'Admin' || data.role === 'شريك') {
            data.role = 'admin';
        }

        if (data.role && !VALID_ROLES.includes(data.role)) {
            return res.status(400).json({ error: 'دور المستخدم غير صالح' });
        }

        const id = generateId();
        const now = new Date().toISOString();
        const activeInt = data.active !== false ? 1 : 0;
        
        const rawEmail = data.email.trim().toLowerCase();
        
        // Handle password constraint
        let password_hash = '';
        if (data.password) {
            password_hash = await bcrypt.hash(data.password, 12);
        } else {
            // Provide dummy hash if not passed, since it's not null in DB schema
            password_hash = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 12);
        }

        await dbAsync.run(
            `INSERT INTO users (id, name, role, email, phone, active, password_hash, "_createdAt", "_updatedAt", _deleted) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
            [id, data.name, data.role, rawEmail, data.phone || null, activeInt, password_hash, now, now]
        );

        // Audit log
        await logAuditEvents(req.user.id, 'CREATE_USER', 'users', id, { name: data.name, role: data.role, email: rawEmail });

        const newItem = { id, name: data.name, role: data.role, email: rawEmail, phone: data.phone, active: activeInt === 1, _createdAt: now };
        res.status(201).json(newItem);
    } catch (err) {
        console.error(err);
        if (err.message.includes('حقول غير معروفة') || err.message.includes('مطلوبة')) {
            return res.status(400).json({ error: err.message });
        }
        if (err.code === '23505' || (err.message && err.message.includes('UNIQUE'))) {
            return res.status(409).json({ error: 'هذا السجل موجود بالفعل (البريد مكرر)' });
        }
        res.status(500).json({ error: 'Server error' });
    }
});

router.put('/:id', requireSuperAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        // Don't require all fields on update, just validate what's given
        const data = validateFields(req.body, ALLOWED_USER_FIELDS, []); 
        if (Object.keys(data).length === 0) return res.status(400).json({ error: 'لا توجد بيانات للتحديث' });

        // Normalize role
        if (data.role === 'Admin' || data.role === 'شريك') {
            data.role = 'admin';
        }

        if (data.role && !VALID_ROLES.includes(data.role)) {
            return res.status(400).json({ error: 'دور المستخدم غير صالح' });
        }

        const oldUser = await dbAsync.get(`SELECT * FROM users WHERE id = ? AND _deleted = 0`, [id]);
        if (!oldUser) return res.status(404).json({ error: 'Not found' });

        const now = new Date().toISOString();
        let assignments = [];
        let params = [];
        let auditDetails = {};

        for (const [k, v] of Object.entries(data)) {
            if (k === 'password') {
                assignments.push(`password_hash = ?`);
                params.push(await bcrypt.hash(v, 12));
                auditDetails.password = 'CHANGED';
            } else if (k === 'active') {
                assignments.push(`active = ?`);
                params.push(v ? 1 : 0);
                if (!!oldUser.active !== !!v) auditDetails.active = v;
            } else if (k === 'email') {
                assignments.push(`email = ?`);
                const em = v.trim().toLowerCase();
                params.push(em);
                if (oldUser.email !== em) auditDetails.email = em;
            } else {
                assignments.push(`${k} = ?`);
                params.push(v);
                if (oldUser[k] !== v) auditDetails[k] = v;
            }
        }

        if (assignments.length > 0) {
            assignments.push(`"_updatedAt" = ?`);
            params.push(now);

            await dbAsync.run(
                `UPDATE users SET ${assignments.join(', ')} WHERE id = ?`,
                [...params, id]
            );

            // Audit events based on changes
            if (auditDetails.role) {
                await logAuditEvents(req.user.id, 'CHANGE_ROLE', 'users', id, { oldRole: oldUser.role, newRole: data.role });
            }
            if (auditDetails.active !== undefined) {
                await logAuditEvents(req.user.id, data.active ? 'ACTIVATE_USER' : 'DEACTIVATE_USER', 'users', id, {});
            }
            if (Object.keys(auditDetails).length > 0 && !auditDetails.role && auditDetails.active === undefined) {
                 await logAuditEvents(req.user.id, 'UPDATE_USER', 'users', id, auditDetails);
            }
        }

        const updated = await dbAsync.get(`SELECT id, name, role, email, phone, active, "_createdAt", "_updatedAt" FROM users WHERE id = ?`, [id]);
        updated.active = !!updated.active;

        res.json({ newItem: updated });
    } catch (err) {
        console.error(err);
        if (err.message.includes('حقول غير معروفة')) return res.status(400).json({ error: err.message });
        if (err.code === '23505' || (err.message && err.message.includes('UNIQUE'))) {
            return res.status(409).json({ error: 'هذا السجل موجود بالفعل' });
        }
        res.status(500).json({ error: 'Server error' });
    }
});

router.delete('/:id', requireSuperAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        await dbAsync.run(
            `UPDATE users SET _deleted = 1, "_updatedAt" = ? WHERE id = ?`,
            [new Date().toISOString(), id]
        );
        await logAuditEvents(req.user.id, 'DEACTIVATE_USER', 'users', id, { reason: 'deleted via standard route' });
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message || 'Server error' });
    }
});

module.exports = router;
