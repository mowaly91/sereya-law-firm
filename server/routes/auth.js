// ========================================
// AUTH ROUTES
// POST /api/auth/login
// POST /api/auth/set-password
// POST /api/auth/send-invite
// ========================================

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { dbAsync } = require('../db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'sereya-law-firm-secret-2026';
const JWT_EXPIRES = '7d';
const INVITE_EXPIRES_HOURS = 48;

// ---- Nodemailer transporter (configure via .env) ----
function createTransporter() {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER || '',
            pass: process.env.SMTP_PASS || ''
        }
    });
}

// ---- POST /api/auth/login ----
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبان' });
        }

        const user = await dbAsync.get(
            `SELECT * FROM users WHERE email = ? AND _deleted = 0`,
            [email.trim().toLowerCase()]
        );

        if (!user) {
            return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });
        }

        if (!user.active) {
            return res.status(403).json({ error: 'الحساب غير نشط، يرجى التواصل مع المسؤول' });
        }

        if (!user.password_hash) {
            return res.status(403).json({ error: 'لم يتم تعيين كلمة مرور بعد، يرجى التحقق من بريدك الإلكتروني للدعوة' });
        }

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });
        }

        const payload = {
            id: user.id,
            name: user.name,
            role: user.role,
            email: user.email
        };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

        res.json({ token, user: payload });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'خطأ في الخادم' });
    }
});

// ---- POST /api/auth/set-password ----
router.post('/set-password', async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            return res.status(400).json({ error: 'الرمز وكلمة المرور مطلوبان' });
        }

        if (password.length < 8) {
            return res.status(400).json({ error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' });
        }

        const user = await dbAsync.get(
            `SELECT * FROM users WHERE invite_token = ? AND _deleted = 0`,
            [token]
        );

        if (!user) {
            return res.status(400).json({ error: 'الرمز غير صالح أو منتهي الصلاحية' });
        }

        // Check expiry
        if (user.invite_token_expires) {
            const expires = new Date(user.invite_token_expires);
            if (new Date() > expires) {
                return res.status(400).json({ error: 'انتهت صلاحية رابط الدعوة، يرجى طلب دعوة جديدة' });
            }
        }

        const hash = await bcrypt.hash(password, 12);
        await dbAsync.run(
            `UPDATE users SET password_hash = ?, invite_token = NULL, invite_token_expires = NULL, _updatedAt = ? WHERE id = ?`,
            [hash, new Date().toISOString(), user.id]
        );

        res.json({ success: true, message: 'تم تعيين كلمة المرور بنجاح' });
    } catch (err) {
        console.error('Set-password error:', err);
        res.status(500).json({ error: 'خطأ في الخادم' });
    }
});

// ---- POST /api/auth/send-invite ----
router.post('/send-invite', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ error: 'معرف المستخدم مطلوب' });
        }

        const user = await dbAsync.get(`SELECT * FROM users WHERE id = ? AND _deleted = 0`, [userId]);
        if (!user) {
            return res.status(404).json({ error: 'المستخدم غير موجود' });
        }
        if (!user.email) {
            return res.status(400).json({ error: 'لا يوجد بريد إلكتروني للمستخدم' });
        }

        // Generate secure token
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date();
        expires.setHours(expires.getHours() + INVITE_EXPIRES_HOURS);

        await dbAsync.run(
            `UPDATE users SET invite_token = ?, invite_token_expires = ?, _updatedAt = ? WHERE id = ?`,
            [token, expires.toISOString(), new Date().toISOString(), userId]
        );

        // Derive the app URL from the request origin when not explicitly configured
        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
        const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
        const appUrl = process.env.APP_URL || `${protocol}://${host}`;
        const inviteLink = `${appUrl}/?token=${token}#/set-password`;

        // Attempt to send email (non-fatal if SMTP not configured)
        let emailSent = false;
        if (process.env.SMTP_USER) {
            try {
                const transporter = createTransporter();
                await transporter.sendMail({
                    from: `"مكتب سرية للمحاماة" <${process.env.SMTP_USER}>`,
                    to: user.email,
                    subject: 'دعوة للانضمام إلى نظام إدارة القضايا',
                    html: `
                    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 40px;">
                        <div style="background: #00182c; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
                            <h1 style="color: #E2AA69; margin: 0; font-size: 24px;">مكتب سرية للمحاماة</h1>
                        </div>
                        <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                            <h2 style="color: #00182c; margin-top: 0;">مرحباً ${user.name}،</h2>
                            <p style="color: #555; line-height: 1.7;">لقد تم إنشاء حساب لك في نظام إدارة القضايا الخاص بمكتب سرية للمحاماة.</p>
                            <p style="color: #555; line-height: 1.7;">يرجى النقر على الزر أدناه لتعيين كلمة المرور الخاصة بك:</p>
                            <div style="text-align: center; margin: 32px 0;">
                                <a href="${inviteLink}" style="background: #E2AA69; color: #00182c; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">تعيين كلمة المرور</a>
                            </div>
                            <p style="color: #888; font-size: 13px;">هذا الرابط صالح لمدة ${INVITE_EXPIRES_HOURS} ساعة.</p>
                            <p style="color: #888; font-size: 12px; border-top: 1px solid #eee; padding-top: 16px; margin-top: 24px; word-break: break-all;">${inviteLink}</p>
                        </div>
                    </div>`
                });
                emailSent = true;
            } catch (emailErr) {
                console.warn('Email send failed (non-fatal):', emailErr.message);
            }
        }

        res.json({ success: true, inviteLink, emailSent, message: emailSent ? 'تم إرسال الدعوة بنجاح' : 'تم إنشاء رابط الدعوة' });
    } catch (err) {
        console.error('Send-invite error:', err);
        res.status(500).json({ error: 'خطأ في الخادم' });
    }
});

module.exports = router;
