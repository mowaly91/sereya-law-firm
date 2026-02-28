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
            _createdAt TEXT,
            _updatedAt TEXT,
            _deleted INTEGER DEFAULT 0
        )`);

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
    });
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
