process.env.JWT_SECRET = 'test-secret';
process.env.FRONTEND_URL = '*';
process.env.DATABASE_URL = 'postgres://fake-for-startup';
process.env.PORT = '3001';

const { db, dbAsync } = require('./db');

// --- Mock Postgres DB In-Memory ---
const memoryDb = {
    users: [],
    audit_logs: [],
    clients: [],
    cases: [],
    sessions: [],
    actions: [],
    deadlines: []
};

// Start the real app (this initializes routes with the stubbed dbAsync methods attached to it via module caching)
require('./server');

// Apply stubs manually after require
dbAsync.get = async (sql, params) => {
    const lsql = sql.toLowerCase();
    if (lsql.includes('from users where email =')) {
        return memoryDb.users.find(u => u.email === params[0] && u._deleted === 0);
    }
    return null;
};

dbAsync.all = async (sql, params) => {
    if (sql.includes('clients')) return memoryDb.clients;
    if (sql.includes('cases')) return memoryDb.cases;
    if (sql.includes('sessions')) return memoryDb.sessions;
    if (sql.includes('actions')) return memoryDb.actions;
    if (sql.includes('deadlines')) return memoryDb.deadlines;
    return [];
};

dbAsync.run = async (sql, params) => {
    const lsql = sql.toLowerCase();
    if (lsql.includes('insert into users')) {
        const emailMatch = sql.match(/INSERT INTO users \(([^)]+)\)/i);
        let email = null;
        if(emailMatch) {
            const fields = emailMatch[1].split(',').map(s => s.trim());
            const emailIndex = fields.indexOf('email');
            if(emailIndex !== -1) email = params[emailIndex];
        }

        if (email && memoryDb.users.some(u => u.email === email)) {
            const err = new Error('Unique violation');
            err.code = '23505'; // Fake Postgres unique violation
            throw err;
        }
        memoryDb.users.push({ email: email });
        return { changes: 1 };
    }
    return { changes: 1 };
};

// Seed script mock logic runs right here identically to db:seed:admin
const bcrypt = require('bcryptjs');
const passwordHash = bcrypt.hashSync('StrongPass123!', 12);
memoryDb.users.push({
    id: 'admin_test',
    name: 'Admin',
    role: 'Admin', // This is what seedAdmin.js uses
    email: 'admin@serya.law',
    active: 1,
    password_hash: passwordHash,
    _deleted: 0
});

// HTTP Runner
setTimeout(async () => {
    console.log('\n--- STARTING VERIFICATION TESTS ---\n');

    // 4) Health Check Endpoint
    const rawFetch = async (url, opts) => await fetch(`http://localhost:3001${url}`, opts);
    let r = await rawFetch('/api/health');
    console.log(`[Health Endpoint] HTTP ${r.status}`);

    // Smoke test endpoints
    const endpoints = ['/api/clients', '/api/cases', '/api/sessions', '/api/actions', '/api/deadlines'];
    for (const ep of endpoints) {
        // Since requireAuth is present, they will fail 401 without token. 
        // We will test 200 properly below!
    }

    // 5) Login and extract Token
    r = await rawFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@serya.law', password: 'StrongPass123!' })
    });
    console.log(`[Login] HTTP ${r.status}`);
    const body = await r.json();
    console.log(`[Token] ${body.token.substring(0, 20)}...`);
    const token = body.token;

    // 4) Smoke Tests Authorized
    console.log('\n[Smoke Tests]');
    for (const ep of endpoints) {
        const rep = await rawFetch(ep, { headers: { 'Authorization': `Bearer ${token}` } });
        console.log(`${ep} -> HTTP ${rep.status}`);
    }

    // 6) Verify super-admin access
    r = await rawFetch('/api/audit', { headers: { 'Authorization': `Bearer ${token}` } });
    console.log(`\n[Audit Endpoint] HTTP ${r.status}`);

    // 7) Verify duplicate constraint handling on users
    const payload = JSON.stringify({ email: 'test@serya.law', name: 'T', password_hash: '123' });
    r = await rawFetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: payload
    });
    console.log(`\n[Create First User] HTTP ${r.status}`); // Should be 201

    r = await rawFetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: payload
    });
    console.log(`[Create Second User (Dupe)] HTTP ${r.status}`); // Should be 409
    const dupBody = await r.json();
    console.log(`[Duplicate Error Message] ${dupBody.error}`);

    process.exit(0);
}, 1000);
