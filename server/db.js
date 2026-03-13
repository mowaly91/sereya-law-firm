const bcrypt = require('bcryptjs');

const usePg = !!process.env.DATABASE_URL;

let db;
let dbAsync = {};

// Helper to convert queries from `?` to `$1`, `$2` etc. for Postgres
function convertQueryForPg(sql) {
    let index = 1;
    return sql.replace(/\?/g, () => '$' + index++);
}

async function seedInitialUser() {
    try {
        const countRow = await dbAsync.get('SELECT COUNT(*) as count FROM users WHERE _deleted = 0');
        const count = parseInt(countRow.count, 10);
        if (count === 0) {
            console.log('Seeding initial admin user...');
            const id = 'admin_' + Date.now().toString(36);
            const passwordHash = await bcrypt.hash('Serya@2026', 12);
            await dbAsync.run(
                `INSERT INTO users (id, name, role, email, active, password_hash, _createdAt, _updatedAt, _deleted) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [id, 'أحمد أحمد سريا', 'شريك', 'ahmed@serya.law', 1, passwordHash, new Date().toISOString(), new Date().toISOString(), 0]
            );
            console.log('✅ Initial admin user created: ahmed@serya.law / Serya@2026');
        }
    } catch (err) {
        console.error('Error seeding user:', err);
    }
}

if (usePg) {
    const { Pool } = require('pg');
    console.log('Connecting to PostgreSQL database using DATABASE_URL...');
    db = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    db.on('connect', () => console.log('✅ Connected to PostgreSQL database.'));

    dbAsync.get = async (sql, params = []) => {
        const res = await db.query(convertQueryForPg(sql), params);
        return res.rows[0];
    };
    dbAsync.all = async (sql, params = []) => {
        const res = await db.query(convertQueryForPg(sql), params);
        return res.rows;
    };
    dbAsync.run = async (sql, params = []) => {
        const res = await db.query(convertQueryForPg(sql), params);
        return { changes: res.rowCount };
    };

    async function createTablesPg() {
        try {
            await db.query(`CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY, name TEXT, role TEXT, email TEXT, phone TEXT,
                active INTEGER DEFAULT 1, password_hash TEXT, invite_token TEXT,
                invite_token_expires TEXT, _createdAt TEXT, _updatedAt TEXT, _deleted INTEGER DEFAULT 0
            )`);
            
            await db.query(`CREATE TABLE IF NOT EXISTS clients (
                id TEXT PRIMARY KEY, name TEXT, nationalId TEXT, phone TEXT, address TEXT,
                poaNumber TEXT, notaryOffice TEXT, poaDate TEXT, attachments TEXT, notes TEXT,
                driveFolderUrl TEXT, driveFolderId TEXT, _createdAt TEXT, _updatedAt TEXT, _deleted INTEGER DEFAULT 0
            )`);

            await db.query(`CREATE TABLE IF NOT EXISTS cases (
                id TEXT PRIMARY KEY, caseNo TEXT, year TEXT, stageType TEXT, clientId TEXT,
                clientIds TEXT, primaryClientId TEXT, clientRole TEXT, opponentName TEXT, opponentRole TEXT,
                court TEXT, circuit TEXT, caseType TEXT, subject TEXT, firstSessionDate TEXT,
                ownerId TEXT, status TEXT, criminalStageType TEXT, linkedProsecutionId TEXT,
                notes TEXT, _createdAt TEXT, _updatedAt TEXT, _deleted INTEGER DEFAULT 0
            )`);

            await db.query(`CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY, caseId TEXT, date TEXT, sessionType TEXT, decisionResult TEXT,
                nextSessionDate TEXT, status TEXT, closureReason TEXT, notes TEXT, attachments TEXT,
                _createdAt TEXT, _updatedAt TEXT, _deleted INTEGER DEFAULT 0
            )`);

            await db.query(`CREATE TABLE IF NOT EXISTS actions (
                id TEXT PRIMARY KEY, clientId TEXT, caseId TEXT, sessionId TEXT, actionType TEXT,
                title TEXT, priority TEXT, responsibleUserId TEXT, status TEXT, executionDate TEXT,
                executionDetails TEXT, subTasks TEXT, dueDate TEXT, notes TEXT, attachments TEXT,
                _createdAt TEXT, _updatedAt TEXT, _deleted INTEGER DEFAULT 0
            )`);

            await db.query(`CREATE TABLE IF NOT EXISTS deadlines (
                id TEXT PRIMARY KEY, caseId TEXT, deadlineType TEXT, startDate TEXT, endDate TEXT,
                responsibleUserId TEXT, status TEXT, completionNote TEXT, _createdAt TEXT,
                _updatedAt TEXT, _deleted INTEGER DEFAULT 0
            )`);

            await db.query(`CREATE TABLE IF NOT EXISTS lookup_mappings (
                id TEXT PRIMARY KEY, decisionType TEXT, actionTypes TEXT,
                _createdAt TEXT, _updatedAt TEXT, _deleted INTEGER DEFAULT 0
            )`);

            await db.query(`CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY, value TEXT
            )`);

            await db.query(`CREATE TABLE IF NOT EXISTS audit_logs (
                id TEXT PRIMARY KEY, userId TEXT, action TEXT, entity TEXT, entityId TEXT,
                details TEXT, _createdAt TEXT
            )`);

            // Migrate columns IF NOT EXISTS
            try { await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT`); } catch (e) {}
            try { await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS invite_token TEXT`); } catch (e) {}
            try { await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS invite_token_expires TEXT`); } catch (e) {}

            console.log('PostgreSQL Database tables verified/created.');
            await seedInitialUser();
        } catch (err) {
            console.error('PostgreSQL Initialization Error:', err);
        }
    }
    
    // Automatically init schemas on import.
    createTablesPg();
} else {
    // ----------------------------------------------------
    // LOCAL SQLITE FALLBACK
    // ----------------------------------------------------
    const sqlite3 = require('sqlite3').verbose();
    const path = require('path');
    console.log('No DATABASE_URL found. Using local SQLite fallback...');

    const dbPath = path.resolve(__dirname, 'database.sqlite');
    db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Error opening database', err.message);
        } else {
            console.log('✅ Connected to local SQLite database.');
            createTablesSqlite();
        }
    });

    dbAsync.get = (sql, params = []) => new Promise((resolve, reject) => {
        db.get(sql, params, (err, result) => {
            if (err) reject(err); else resolve(result);
        });
    });
    dbAsync.all = (sql, params = []) => new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err); else resolve(rows);
        });
    });
    dbAsync.run = (sql, params = []) => new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err); else resolve(this);
        });
    });

    function createTablesSqlite() {
        db.serialize(() => {
            // Include exactly the same schemas but with SQLite syntax
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY, name TEXT, role TEXT, email TEXT, phone TEXT,
                active INTEGER DEFAULT 1, password_hash TEXT, invite_token TEXT,
                invite_token_expires TEXT, _createdAt TEXT, _updatedAt TEXT, _deleted INTEGER DEFAULT 0
            )`);
            db.run(`ALTER TABLE users ADD COLUMN password_hash TEXT`, () => {});
            db.run(`ALTER TABLE users ADD COLUMN invite_token TEXT`, () => {});
            db.run(`ALTER TABLE users ADD COLUMN invite_token_expires TEXT`, () => {});

            db.run(`CREATE TABLE IF NOT EXISTS clients (
                id TEXT PRIMARY KEY, name TEXT, nationalId TEXT, phone TEXT, address TEXT,
                poaNumber TEXT, notaryOffice TEXT, poaDate TEXT, attachments TEXT, notes TEXT,
                driveFolderUrl TEXT, driveFolderId TEXT, _createdAt TEXT, _updatedAt TEXT, _deleted INTEGER DEFAULT 0
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS cases (
                id TEXT PRIMARY KEY, caseNo TEXT, year TEXT, stageType TEXT, clientId TEXT,
                clientIds TEXT, primaryClientId TEXT, clientRole TEXT, opponentName TEXT, opponentRole TEXT,
                court TEXT, circuit TEXT, caseType TEXT, subject TEXT, firstSessionDate TEXT,
                ownerId TEXT, status TEXT, criminalStageType TEXT, linkedProsecutionId TEXT,
                notes TEXT, _createdAt TEXT, _updatedAt TEXT, _deleted INTEGER DEFAULT 0
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY, caseId TEXT, date TEXT, sessionType TEXT, decisionResult TEXT,
                nextSessionDate TEXT, status TEXT, closureReason TEXT, notes TEXT, attachments TEXT,
                _createdAt TEXT, _updatedAt TEXT, _deleted INTEGER DEFAULT 0
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS actions (
                id TEXT PRIMARY KEY, clientId TEXT, caseId TEXT, sessionId TEXT, actionType TEXT,
                title TEXT, priority TEXT, responsibleUserId TEXT, status TEXT, executionDate TEXT,
                executionDetails TEXT, subTasks TEXT, dueDate TEXT, notes TEXT, attachments TEXT,
                _createdAt TEXT, _updatedAt TEXT, _deleted INTEGER DEFAULT 0
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS deadlines (
                id TEXT PRIMARY KEY, caseId TEXT, deadlineType TEXT, startDate TEXT, endDate TEXT,
                responsibleUserId TEXT, status TEXT, completionNote TEXT, _createdAt TEXT,
                _updatedAt TEXT, _deleted INTEGER DEFAULT 0
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS lookup_mappings (
                id TEXT PRIMARY KEY, decisionType TEXT, actionTypes TEXT,
                _createdAt TEXT, _updatedAt TEXT, _deleted INTEGER DEFAULT 0
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)`);

            db.run(`CREATE TABLE IF NOT EXISTS audit_logs (
                id TEXT PRIMARY KEY, userId TEXT, action TEXT, entity TEXT, entityId TEXT,
                details TEXT, _createdAt TEXT
            )`);

            console.log('SQLite Database tables verified/created.');
            seedInitialUser();
        });
    }
}

module.exports = { db, dbAsync };
