// ============================================================================
// startup.js — Render free-tier bootstrap orchestrator
// ============================================================================
// Runs on every deploy before server.js:
//   1. Validate required production env vars (fail fast)
//   2. Run DB migrations — if schema already exists but pgmigrations table
//      doesn't, we manually bootstrap the tracking table with raw SQL
//      (avoids node-pg-migrate runner crashing on "table already exists")
//   3. Seed initial admin user if users table is empty
//   4. Launch server.js
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

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    });

    try {
        // Check whether schema already exists vs fresh DB
        const { rows: u }  = await pool.query(`SELECT to_regclass('public.users') AS tbl`);
        const { rows: pg } = await pool.query(`SELECT to_regclass('public.pgmigrations') AS tbl`);

        const usersExist     = !!u[0].tbl;
        const trackingExists = !!pg[0].tbl;

        if (usersExist && !trackingExists) {
            // ── Existing DB: manually create tracking table + record applied migrations
            // We do NOT use the node-pg-migrate runner here because it would try
            // to re-execute CREATE TABLE statements that already exist.
            console.log('[STARTUP] Existing schema detected — bootstrapping migration tracking...');

            await pool.query(`
                CREATE TABLE pgmigrations (
                    id     SERIAL       PRIMARY KEY,
                    name   VARCHAR(255) NOT NULL,
                    run_on TIMESTAMP    NOT NULL DEFAULT now()
                )
            `);

            // Migration 1 — initial schema (users table already exists)
            await pool.query(
                `INSERT INTO pgmigrations (name, run_on) VALUES ($1, now())`,
                ['1773920954370_initial-schema']
            );

            // Migration 2 — google-sheet fields: check if columns already exist
            const { rows: col } = await pool.query(`
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'clients' AND column_name = 'driveLink'
                LIMIT 1
            `);

            if (col.length > 0) {
                // Columns exist → record migration 2 as done too, nothing to run
                await pool.query(
                    `INSERT INTO pgmigrations (name, run_on) VALUES ($1, now())`,
                    ['1773930854841_add-client-google-sheet-fields']
                );
                console.log('[STARTUP] ✅ Migration tracking bootstrapped (all migrations applied).');
                return; // Done — skip runner entirely
            } else {
                // Columns missing → record migration 1 only, let runner apply migration 2
                console.log('[STARTUP] ✅ Migration 1 recorded. Will now apply migration 2...');
            }
        }
    } catch (err) {
        console.error('[STARTUP] ❌ Pre-flight migration check failed:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
    }

    // ── Normal path: runner applies any pending migrations ───────────────────
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
        return; // Not configured — skip silently
    }

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
            `INSERT INTO users (id, name, role, email, active, password_hash, _createdAt, _updatedAt, _deleted)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [id, 'Admin', 'admin', email.trim().toLowerCase(), 1, hash, now, now, 0]
        );
        console.log('[STARTUP] ✅ Initial admin user created successfully.');
    } catch (err) {
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
