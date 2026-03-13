// ========================================
// SEREYA LAW FIRM – Full API Test Suite
// Usage:
//   node tests/api.test.cjs                                 (local)
//   node tests/api.test.cjs https://your-app.onrender.com  (production)
// ========================================

const BASE_URL = process.argv[2] || 'http://localhost:3000';

const CREDENTIALS = { email: 'ahmed@serya.law', password: 'Serya@2026' };

let passed = 0;
let failed = 0;
let jwtToken = '';
let createdClientId = '';
let createdCaseId = '';

// ---- Helpers ----
function ok(name, condition, info = '') {
    if (condition) {
        console.log(`  ✅  PASS  ${name}`);
        passed++;
    } else {
        console.error(`  ❌  FAIL  ${name}${info ? ' → ' + info : ''}`);
        failed++;
    }
}

async function api(method, path, body, token) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);
    try {
        const res = await fetch(`${BASE_URL}${path}`, opts);
        let json;
        try { json = await res.json(); } catch { json = null; }
        return { status: res.status, json };
    } catch (err) {
        return { status: 0, json: null, error: err.message };
    }
}

// ---- Test Sections ----
async function testHealth() {
    console.log('\n🔍 [1] Health Check');
    const r = await api('GET', '/api/health');
    ok('GET /api/health → 200', r.status === 200);
    ok('Response has status:ok', r.json?.status === 'ok');
}

async function testAuth() {
    console.log('\n🔐 [2] Authentication');

    // Missing fields
    const r1 = await api('POST', '/api/auth/login', { email: '', password: '' });
    ok('Login – missing fields → 400', r1.status === 400);

    // Wrong password
    const r2 = await api('POST', '/api/auth/login', { email: CREDENTIALS.email, password: 'wrongpassword!' });
    ok('Login – wrong password → 401', r2.status === 401);

    // Wrong email
    const r3 = await api('POST', '/api/auth/login', { email: 'nobody@nowhere.com', password: 'whatever' });
    ok('Login – unknown email → 401', r3.status === 401);

    // Valid login
    const r4 = await api('POST', '/api/auth/login', CREDENTIALS);
    ok('Login – valid credentials → 200', r4.status === 200);
    ok('Login – returns JWT token', typeof r4.json?.token === 'string' && r4.json.token.length > 10);
    ok('Login – returns user object', typeof r4.json?.user === 'object');
    ok('Login – user has correct email', r4.json?.user?.email === CREDENTIALS.email);

    if (r4.json?.token) {
        jwtToken = r4.json.token;
    }
}

async function testJWTGuard() {
    console.log('\n🛡️  [3] JWT Guard');

    // No token
    const r1 = await api('GET', '/api/clients');
    ok('GET /api/clients – no token → 401', r1.status === 401);

    const r2 = await api('GET', '/api/cases');
    ok('GET /api/cases – no token → 401', r2.status === 401);

    const r3 = await api('GET', '/api/users');
    ok('GET /api/users – no token → 401', r3.status === 401);

    // Invalid token
    const r4 = await api('GET', '/api/clients', null, 'bad.token.here');
    ok('GET /api/clients – invalid token → 401', r4.status === 401);

    // Valid token
    const r5 = await api('GET', '/api/clients', null, jwtToken);
    ok('GET /api/clients – valid token → 200', r5.status === 200);
    ok('GET /api/clients – returns array', Array.isArray(r5.json));
}

async function testClientsCRUD() {
    console.log('\n👥 [4] Clients CRUD');

    // Create
    const newClient = {
        name: 'عميل اختبار تلقائي',
        nationalId: '9999999999',
        phone: '0501234567',
        address: 'الرياض – اختبار'
    };
    const r1 = await api('POST', '/api/clients', newClient, jwtToken);
    ok('POST /api/clients → 201', r1.status === 201);
    ok('POST /api/clients – has id', typeof r1.json?.id === 'string');
    createdClientId = r1.json?.id || '';

    // Read all
    const r2 = await api('GET', '/api/clients', null, jwtToken);
    ok('GET /api/clients → 200 + array', r2.status === 200 && Array.isArray(r2.json));

    // Read by ID
    if (createdClientId) {
        const r3 = await api('GET', `/api/clients/${createdClientId}`, null, jwtToken);
        ok('GET /api/clients/:id → 200', r3.status === 200);
        ok('GET /api/clients/:id – correct name', r3.json?.name === newClient.name);
    }

    // Update
    if (createdClientId) {
        const r4 = await api('PUT', `/api/clients/${createdClientId}`, { phone: '0551234567' }, jwtToken);
        ok('PUT /api/clients/:id → 200', r4.status === 200);
    }

    // Unknown ID → 404
    const r5 = await api('GET', '/api/clients/nonexistent_id_xyz', null, jwtToken);
    ok('GET /api/clients/nonexistent → 404', r5.status === 404);

    // Soft delete
    if (createdClientId) {
        const r6 = await api('DELETE', `/api/clients/${createdClientId}`, null, jwtToken);
        ok('DELETE /api/clients/:id → 200', r6.status === 200);

        // Verify deleted record is gone
        const r7 = await api('GET', `/api/clients/${createdClientId}`, null, jwtToken);
        ok('GET after DELETE → 404', r7.status === 404);
    }
}

async function testCasesCRUD() {
    console.log('\n⚖️  [5] Cases CRUD');

    const newCase = {
        caseNo: 'TEST-001',
        year: '2026',
        stageType: 'ابتدائي',
        caseType: 'مدني',
        court: 'المحكمة العامة',
        status: 'جارٍ'
    };
    const r1 = await api('POST', '/api/cases', newCase, jwtToken);
    ok('POST /api/cases → 201', r1.status === 201);
    createdCaseId = r1.json?.id || '';

    const r2 = await api('GET', '/api/cases', null, jwtToken);
    ok('GET /api/cases → 200 + array', r2.status === 200 && Array.isArray(r2.json));

    if (createdCaseId) {
        const r3 = await api('GET', `/api/cases/${createdCaseId}`, null, jwtToken);
        ok(`GET /api/cases/:id → 200`, r3.status === 200);

        const r4 = await api('DELETE', `/api/cases/${createdCaseId}`, null, jwtToken);
        ok('DELETE /api/cases/:id → 200', r4.status === 200);
    }
}

async function testSettings() {
    console.log('\n⚙️  [6] Settings');

    const r1 = await api('GET', '/api/settings');
    ok('GET /api/settings → 200', r1.status === 200);
    ok('GET /api/settings – returns object', typeof r1.json === 'object' && !Array.isArray(r1.json));

    const r2 = await api('POST', '/api/settings', { key: '_test_key', value: 'hello' });
    ok('POST /api/settings → 200', r2.status === 200);
    ok('POST /api/settings – echoes key/value', r2.json?.key === '_test_key');
}

async function testUsers() {
    console.log('\n👤 [7] Users');

    const r1 = await api('GET', '/api/users', null, jwtToken);
    ok('GET /api/users → 200 + array', r1.status === 200 && Array.isArray(r1.json));
    ok('GET /api/users – at least 1 user exists', r1.json?.length >= 1);
    ok('GET /api/users – admin user present', r1.json?.some(u => u.email === CREDENTIALS.email));
}

// ---- Runner ----
async function run() {
    console.log('='.repeat(60));
    console.log(`  SEREYA LAW FIRM – API TEST SUITE`);
    console.log(`  Target: ${BASE_URL}`);
    console.log(`  Time:   ${new Date().toLocaleString('ar-EG')}`);
    console.log('='.repeat(60));

    await testHealth();
    await testAuth();

    if (!jwtToken) {
        console.error('\n⛔ Cannot continue: login failed – no JWT token obtained.');
        process.exit(1);
    }

    await testJWTGuard();
    await testClientsCRUD();
    await testCasesCRUD();
    await testSettings();
    await testUsers();

    const total = passed + failed;
    console.log('\n' + '='.repeat(60));
    console.log(`  RESULTS: ${passed}/${total} passed, ${failed} failed`);
    console.log('='.repeat(60));
    process.exit(failed > 0 ? 1 : 0);
}

run();
