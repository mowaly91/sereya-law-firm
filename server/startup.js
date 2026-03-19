// ============================================================================
// startup.js — Render free-tier bootstrap orchestrator
// ============================================================================
// Runs on every deploy before server.js:
//   1. Validate required production env vars (fail fast)
//   2. Run DB migrations (idempotent — safe to re-run against existing schema)
//   3. Force-reset admin password if RESET_ADMIN_PASSWORD=true
//   4. Seed initial admin if users table is empty
//   5. Launch server.js
// ============================================================================

'use strict';

require('dotenv').config();

const path     = require('path');
const bcrypt   = require('bcryptjs');
const { Pool } = require('pg');
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

// ── 2. Run DB migrations ─────────────────────────────────────────────────────
async function runMigrations() {
    console.log('[STARTUP] Running database migrations...');

    // Clean up any partially-applied migration 3 record so it re-runs cleanly
    const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    try {
        // Guarantee Google Sheet import columns exist (bypassing migration state issues)
        await pool.query(`ALTER TABLE clients ADD COLUMN IF NOT EXISTS "fullNameAr" TEXT`);
        await pool.query(`ALTER TABLE clients ADD COLUMN IF NOT EXISTS "powerOfAttorneyNo" TEXT`);
        await pool.query(`ALTER TABLE clients ADD COLUMN IF NOT EXISTS "driveLink" TEXT`);
        await pool.query(`ALTER TABLE clients ADD COLUMN IF NOT EXISTS "sourceIndex" TEXT`);

        const { rows: pg } = await pool.query(`SELECT to_regclass('public.pgmigrations') AS tbl`);
        if (pg[0].tbl) {
            await pool.query(
                `DELETE FROM pgmigrations WHERE name = $1`,
                ['1773940000000_ensure-missing-tables']
            );
        }
    } catch (e) {
        // Non-fatal — table may not exist yet on fresh DB
    } finally {
        await pool.end();
    }

    try {
        const migrationsRun = await runner({
            databaseUrl:     process.env.DATABASE_URL,
            dir:             path.join(__dirname, 'migrations'),
            direction:       'up',
            migrationsTable: 'pgmigrations',
            count:           Infinity,
            ssl:             { rejectUnauthorized: false },
        });
        if (migrationsRun && migrationsRun.length > 0) {
            console.log(`[STARTUP] ✅ ${migrationsRun.length} migration(s) applied.`);
        } else {
            console.log('[STARTUP] ✅ DB schema is up to date.');
        }
    } catch (err) {
        console.error('[STARTUP] ❌ Migration failed:', err.message);
        process.exit(1);
    }
}


// ── 3. Force-reset admin password (one-time escape hatch) ────────────────────
// Set RESET_ADMIN_PASSWORD=true in Render env to force-update the password for
// INIT_ADMIN_EMAIL. Remove the env var after first successful login.
async function resetAdminPasswordIfRequested() {
    if (process.env.RESET_ADMIN_PASSWORD !== 'true') return;

    const email    = process.env.INIT_ADMIN_EMAIL;
    const password = process.env.INIT_ADMIN_PASSWORD;
    if (!email || !password) {
        console.warn('[STARTUP] ⚠️  RESET_ADMIN_PASSWORD=true but INIT_ADMIN_EMAIL/PASSWORD not set — skipping.');
        return;
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    try {
        const hash = await bcrypt.hash(password, 12);
        const now  = new Date().toISOString();

        const { rowCount } = await pool.query(
            `UPDATE users SET password_hash = $1, role = 'admin', active = 1, _updatedAt = $2
             WHERE email = $3 AND _deleted = 0`,
            [hash, now, email.trim().toLowerCase()]
        );

        if (rowCount > 0) {
            console.log(`[STARTUP] ✅ Password reset for ${email} (role enforced: admin).`);
        } else {
            const id = 'admin_' + Date.now().toString(36);
            await pool.query(
                `INSERT INTO users (id, name, role, email, active, password_hash, _createdAt, _updatedAt, _deleted)
                 VALUES ($1, 'Admin', 'admin', $2, 1, $3, $4, $4, 0)`,
                [id, email.trim().toLowerCase(), hash, now]
            );
            console.log(`[STARTUP] ✅ Admin user created: ${email}`);
        }
    } catch (err) {
        console.error('[STARTUP] ⚠️  Password reset error (non-fatal):', err.message);
    } finally {
        await pool.end();
    }
}

// ── 4. Seed initial admin user ───────────────────────────────────────────────
async function seedAdminIfNeeded() {
    const email    = process.env.INIT_ADMIN_EMAIL;
    const password = process.env.INIT_ADMIN_PASSWORD;
    if (!email || !password) return;

    const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    try {
        const { rows } = await pool.query(`SELECT COUNT(*) AS count FROM users WHERE _deleted = 0`);
        if (parseInt(rows[0].count, 10) > 0) {
            console.log('[STARTUP] ✅ Users already exist — skipping admin seed.');
            return;
        }
        const id   = 'admin_' + Date.now().toString(36);
        const hash = await bcrypt.hash(password, 12);
        const now  = new Date().toISOString();
        await pool.query(
            `INSERT INTO users (id, name, role, email, active, password_hash, _createdAt, _updatedAt, _deleted)
             VALUES ($1, 'Admin', 'admin', $2, 1, $3, $4, $4, 0)`,
            [id, email.trim().toLowerCase(), hash, now]
        );
        console.log(`[STARTUP] ✅ Initial admin created: ${email}`);
    } catch (err) {
        if (err.code === '23505') {
            console.log('[STARTUP] ℹ️  Admin already exists — skipping.');
        } else {
            console.error('[STARTUP] ⚠️  Admin seed error (non-fatal):', err.message);
        }
    } finally {
        await pool.end();
    }
}

// ── 5. Launch server.js ──────────────────────────────────────────────────────
async function main() {
    await runMigrations();
    await resetAdminPasswordIfRequested();
    await seedAdminIfNeeded();
    console.log('[STARTUP] 🚀 Starting server...');
    require('./server.js');
}

main().catch(err => {
    console.error('[STARTUP] ❌ Fatal startup error:', err);
    process.exit(1);
});
