// ============================================================================
// startup.js — Render free-tier bootstrap orchestrator
// ============================================================================
// On Render free tier there is no Shell access, so this file handles every
// boot-time task automatically before handing off to server.js:
//
//   1. Validate required production env vars (fail fast)
//   2. Run pending node-pg-migrate database migrations
//   3. Seed the initial admin user if the users table is empty
//      (only if INIT_ADMIN_EMAIL + INIT_ADMIN_PASSWORD are set)
//   4. Launch server.js
//
// ============================================================================

'use strict';

require('dotenv').config();

const path     = require('path');
const bcrypt   = require('bcryptjs');
const { Pool } = require('pg');
// node-pg-migrate exposes `runner` as a named CommonJS export
const { runner } = require('node-pg-migrate');

// ── 1. Fail-fast: required env vars ─────────────────────────────────────────
(function validateEnv() {
    if (process.env.NODE_ENV !== 'production') return;

    const missing = [];
    if (!process.env.DATABASE_URL) missing.push('DATABASE_URL');
    if (!process.env.JWT_SECRET)   missing.push('JWT_SECRET');

    if (missing.length) {
        console.error('[STARTUP] ❌ Missing required production env vars:', missing.join(', '));
        process.exit(1);
    }
    console.log('[STARTUP] ✅ Env vars validated.');
}());

// ── 2. Run DB migrations (node-pg-migrate programmatic API) ─────────────────
async function runMigrations() {
    console.log('[STARTUP] Running database migrations...');
    try {
        const migrationsRun = await runner({
            databaseUrl:     process.env.DATABASE_URL,
            dir:             path.join(__dirname, 'migrations'),
            direction:       'up',
            migrationsTable: 'pgmigrations',
            count:           Infinity,
            // Render PostgreSQL requires SSL
            ssl: { rejectUnauthorized: false },
        });

        if (migrationsRun && migrationsRun.length > 0) {
            console.log(
                `[STARTUP] ✅ ${migrationsRun.length} migration(s) applied:`,
                migrationsRun.map(m => m.name || m.file || String(m)).join(', ')
            );
        } else {
            console.log('[STARTUP] ✅ DB schema is up to date (no pending migrations).');
        }
    } catch (err) {
        console.error('[STARTUP] ❌ Migration failed:', err.message);
        process.exit(1);
    }
}

// ── 3. Seed initial admin user ───────────────────────────────────────────────
async function seedAdminIfNeeded() {
    const email    = process.env.INIT_ADMIN_EMAIL;
    const password = process.env.INIT_ADMIN_PASSWORD;

    if (!email || !password) {
        // Not configured — skip silently (prod may already have users)
        return;
    }

    // We need a direct pool connection (db.js is not loaded yet at this point)
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    });

    try {
        const { rows } = await pool.query(
            `SELECT COUNT(*) AS count FROM users WHERE _deleted = 0`
        );
        const count = parseInt(rows[0].count, 10);

        if (count > 0) {
            console.log('[STARTUP] ✅ Users already exist — skipping admin seed.');
            return;
        }

        console.log(`[STARTUP] Seeding initial admin: ${email}`);
        const id   = 'admin_' + Date.now().toString(36);
        const hash = await bcrypt.hash(password, 12);
        const now  = new Date().toISOString();

        await pool.query(
            `INSERT INTO users
                (id, name, role, email, active, password_hash, _createdAt, _updatedAt, _deleted)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [id, 'Admin', 'admin', email.trim().toLowerCase(), 1, hash, now, now, 0]
        );
        console.log('[STARTUP] ✅ Initial admin user created successfully.');
    } catch (err) {
        // Non-fatal — if admin already exists (unique constraint) just log it
        if (err.code === '23505') {
            console.log('[STARTUP] ℹ️  Admin email already exists — skipping seed.');
        } else {
            console.error('[STARTUP] ⚠️  Admin seed error (non-fatal):', err.message);
        }
    } finally {
        await pool.end();
    }
}

// ── 4. Launch server.js ──────────────────────────────────────────────────────
async function main() {
    await runMigrations();
    await seedAdminIfNeeded();

    console.log('[STARTUP] 🚀 Starting server...');
    require('./server.js');
}

main().catch(err => {
    console.error('[STARTUP] ❌ Fatal startup error:', err);
    process.exit(1);
});
