// ========================================
// AUTH MIDDLEWARE
//   requireAuth       – verify JWT bearer token
//   requireSuperAdmin – role must be admin OR شريك
// ========================================

const jwt = require('jsonwebtoken');

// ── Fail fast if JWT_SECRET is missing in production ──────────────────────────
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
    console.error('[FATAL] JWT_SECRET environment variable is not set. Refusing to start in production.');
    process.exit(1);
}

const JWT_SECRET = process.env.JWT_SECRET || 'sereya-dev-fallback-NOT-FOR-PRODUCTION';

// ── RBAC strict admin switch ──────────────────────────────────────────────────
const isStrictAdmin = process.env.RBAC_STRICT_ADMIN === 'true';

// Roles that carry full super-admin privileges
// The user explicitly requested to treat 'شريك' (partner) as an admin permanently.
const SUPER_ADMIN_ROLES = isStrictAdmin 
    ? new Set(['admin', 'شريك']) 
    : new Set(['admin', 'Admin', 'شريك']);

// ── requireAuth ────────────────────────────────────────────────────────────────
// Verifies the Bearer JWT and attaches the decoded payload to req.user.
function requireAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'مطلوب تسجيل الدخول' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({ error: 'الجلسة منتهية، يرجى تسجيل الدخول مجدداً' });
    }
}

// ── requireSuperAdmin ──────────────────────────────────────────────────────────
// Must be used AFTER requireAuth. Returns 403 if the caller is not a super-admin.
function requireSuperAdmin(req, res, next) {
    if (!req.user || !SUPER_ADMIN_ROLES.has(req.user.role)) {
        return res.status(403).json({ error: 'هذه العملية متاحة للمسؤولين والشركاء فقط' });
    }
    next();
}

// Keep legacy alias so existing imports of authMiddleware still work
const authMiddleware = requireAuth;

module.exports = { authMiddleware, requireAuth, requireSuperAdmin, JWT_SECRET, SUPER_ADMIN_ROLES };
