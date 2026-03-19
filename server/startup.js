// ============================================================================
// startup.js — Render free-tier bootstrap orchestrator
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

    const MIG1 = '1773920954370_initial-schema';
    const MIG2 = '1773930854841_add-client-google-sheet-fields';

    try {
        // ── What state is the DB in? ────────────────────────────────────────
        const { rows: u } = await pool.query(
            `SELECT to_regclass('public.users') AS tbl`
        );
        const usersExist = !!u[0].tbl;

        if (!usersExist) {
            // Fresh DB — let the runner do everything from scratch
            console.log('[STARTUP] Fresh database — runner will apply all migrations.');
            await pool.end();
            return await runWithRunner();
        }

        // Users table exists. Ensure pgmigrations table exists.
        await pool.query(`
            CREATE TABLE IF NOT EXISTS pgmigrations (
                id     SERIAL       PRIMARY KEY,
                name   VARCHAR(255) NOT NULL,
                run_on TIMESTAMP    NOT NULL DEFAULT now()
            )
        `);

        // Record migration 1 if not already recorded
        const { rows: r1 } = await pool.query(
            `SELECT 1 FROM pgmigrations WHERE name = $1`, [MIG1]
        );
        if (r1.length === 0) {
            await pool.query(
                `INSERT INTO pgmigrations (name, run_on) VALUES ($1, now())`, [MIG1]
            );
            console.log('[STARTUP] ✅ Migration 1 (initial-schema) recorded as applied.');
        }

        // Check if driveLink column exists (migration 2 already applied to schema?)
        const { rows: col } = await pool.query(`
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'clients' AND column_name = 'driveLink'
            LIMIT 1
        `);
        const driveLinkExists = col.length > 0;

        // Record migration 2 if columns already exist in DB
        if (driveLinkExists) {
            const { rows: r2 } = await pool.query(
                `SELECT 1 FROM pgmigrations WHERE name = $1`, [MIG2]
            );
            if (r2.length === 0) {
                await pool.query(
                    `INSERT INTO pgmigrations (name, run_on) VALUES ($1, now())`, [MIG2]
                );
                console.log('[STARTUP] ✅ Migration 2 (google-sheet-fields) recorded as applied.');
            }
            console.log('[STARTUP] ✅ Migration tracking up to date. Schema already current.');
            return; // Both recorded — runner not needed
        }

        // driveLink column missing — migration 2 genuinely needs to run
        console.log('[STARTUP] Migration 2 (google-sheet-fields) not applied — running now...');

    } catch (err) {
        console.error('[STARTUP] ❌ Migration bootstrap failed:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
    }

    // Run only remaining (unrecorded) migrations via runner
    await runWithRunner();
}

async function runWithRunner() {
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
            console.log('[STARTUP] ✅ No pending migrations.');
        }
    } catch (err) {
        console.error('[STARTUP] ❌ Migration runner failed:', err.message);
        process.exit(1);
    }
}

// ── 3. Seed initial admin user ───────────────────────────────────────────────
async function seedAdminIfNeeded() {
    const email    = process.env.INIT_ADMIN_EMAIL;
    const password = process.env.INIT_ADMIN_PASSWORD;
    if (!email || !password) return;

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    });

    try {
        const { rows } = await pool.query(
            `SELECT COUNT(*) AS count FROM users WHERE _deleted = 0`
        );
        if (parseInt(rows[0].count, 10) > 0) {
            console.log('[STARTUP] ✅ Users already exist — skipping admin seed.');
            return;
        }
        const id   = 'admin_' + Date.now().toString(36);
        const hash = await bcrypt.hash(password, 12);
        const now  = new Date().toISOString();
        await pool.query(
            `INSERT INTO users (id, name, role, email, active, password_hash, _createdAt, _updatedAt, _deleted)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [id, 'Admin', 'admin', email.trim().toLowerCase(), 1, hash, now, now, 0]
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
