const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to SQLite database
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to SQLite database.');
        createTables();
    }
});

function createTables() {
    db.serialize(() => {
        // Users
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT,
            role TEXT,
            email TEXT,
            phone TEXT,
            active INTEGER DEFAULT 1,
            password_hash TEXT,
            invite_token TEXT,
            invite_token_expires TEXT,
            _createdAt TEXT,
            _updatedAt TEXT,
            _deleted INTEGER DEFAULT 0
        )`);

        // Migrate existing users table to add auth columns if missing
        db.run(`ALTER TABLE users ADD COLUMN password_hash TEXT`, () => {});
        db.run(`ALTER TABLE users ADD COLUMN invite_token TEXT`, () => {});
        db.run(`ALTER TABLE users ADD COLUMN invite_token_expires TEXT`, () => {});

        // Clients
        db.run(`CREATE TABLE IF NOT EXISTS clients (
            id TEXT PRIMARY KEY,
            name TEXT,
            nationalId TEXT,
            phone TEXT,
            address TEXT,
            poaNumber TEXT,
            notaryOffice TEXT,
            poaDate TEXT,
            attachments TEXT,
            notes TEXT,
            driveFolderUrl TEXT,
            driveFolderId TEXT,
            _createdAt TEXT,
            _updatedAt TEXT,
            _deleted INTEGER DEFAULT 0
        )`);

        // Cases
        db.run(`CREATE TABLE IF NOT EXISTS cases (
            id TEXT PRIMARY KEY,
            caseNo TEXT,
            year TEXT,
            stageType TEXT,
            clientId TEXT,
            clientIds TEXT,
            primaryClientId TEXT,
            clientRole TEXT,
            opponentName TEXT,
            opponentRole TEXT,
            court TEXT,
            circuit TEXT,
            caseType TEXT,
            subject TEXT,
            firstSessionDate TEXT,
            ownerId TEXT,
            status TEXT,
            criminalStageType TEXT,
            linkedProsecutionId TEXT,
            notes TEXT,
            _createdAt TEXT,
            _updatedAt TEXT,
            _deleted INTEGER DEFAULT 0
        )`);

        // Sessions
        db.run(`CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            caseId TEXT,
            date TEXT,
            sessionType TEXT,
            decisionResult TEXT,
            nextSessionDate TEXT,
            status TEXT,
            closureReason TEXT,
            notes TEXT,
            attachments TEXT,
            _createdAt TEXT,
            _updatedAt TEXT,
            _deleted INTEGER DEFAULT 0
        )`);

        // Actions
        db.run(`CREATE TABLE IF NOT EXISTS actions (
            id TEXT PRIMARY KEY,
            clientId TEXT,
            caseId TEXT,
            sessionId TEXT,
            actionType TEXT,
            title TEXT,
            priority TEXT,
            responsibleUserId TEXT,
            status TEXT,
            executionDate TEXT,
            executionDetails TEXT,
            subTasks TEXT,
            dueDate TEXT,
            notes TEXT,
            attachments TEXT,
            _createdAt TEXT,
            _updatedAt TEXT,
            _deleted INTEGER DEFAULT 0
        )`);

        // Deadlines
        db.run(`CREATE TABLE IF NOT EXISTS deadlines (
            id TEXT PRIMARY KEY,
            caseId TEXT,
            deadlineType TEXT,
            startDate TEXT,
            endDate TEXT,
            responsibleUserId TEXT,
            status TEXT,
            completionNote TEXT,
            _createdAt TEXT,
            _updatedAt TEXT,
            _deleted INTEGER DEFAULT 0
        )`);

        // Lookups (Decision mappings)
        db.run(`CREATE TABLE IF NOT EXISTS lookup_mappings (
            id TEXT PRIMARY KEY,
            decisionType TEXT,
            actionTypes TEXT,
            _createdAt TEXT,
            _updatedAt TEXT,
            _deleted INTEGER DEFAULT 0
        )`);

        // Settings
        db.run(`CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        )`);

        // Audit Logs
        db.run(`CREATE TABLE IF NOT EXISTS audit_logs (
            id TEXT PRIMARY KEY,
            userId TEXT,
            action TEXT,
            entity TEXT,
            entityId TEXT,
            details TEXT,
            _createdAt TEXT
        )`);

        console.log('Database tables verified/created.');
        seedInitialUser();
    });
}

const bcrypt = require('bcryptjs');

async function seedInitialUser() {
    try {
        const count = await dbAsync.get('SELECT COUNT(*) as count FROM users WHERE _deleted = 0');
        if (count.count === 0) {
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

// Wrapper for async queries
const dbAsync = {
    get: (sql, params = []) => new Promise((resolve, reject) => {
        db.get(sql, params, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    }),
    all: (sql, params = []) => new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    }),
    run: (sql, params = []) => new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this); // can access this.lastID, this.changes
        });
    })
};

module.exports = { db, dbAsync };
