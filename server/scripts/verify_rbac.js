process.env.DATABASE_URL = 'postgres://fake-for-startup';
const { dbAsync } = require('../db');
const { requireSuperAdmin } = require('../middleware/auth');
const express = require('express');

async function testRBAC() {
    console.log('\n--- 1) TESTING requireSuperAdmin ROLE MATCHING ---');

    const mockRes = () => {
        const res = {};
        res.status = (code) => { res.statusCode = code; return res; };
        res.json = (obj) => { res.jsonObj = obj; return res; };
        return res;
    };

    const runAuthTest = (role, expectedStatus) => {
        const req = { user: { role } };
        const res = mockRes();
        let nextCalled = false;
        
        requireSuperAdmin(req, res, () => { nextCalled = true; });

        if (expectedStatus === 200 && nextCalled) {
            console.log(`  ✅ [PASS] Role: '${role}' -> Passed requireSuperAdmin`);
        } else if (res.statusCode === expectedStatus) {
            console.log(`  ✅ [PASS] Role: '${role}' -> Blocked with ${expectedStatus}`);
        } else {
            console.log(`  ❌ [FAIL] Role: '${role}' -> Expected ${expectedStatus}, Got ${res.statusCode || '200 OK'}`);
        }
    };

    console.log('\n--- Testing with RBAC_STRICT_ADMIN = false (Default) ---');
    process.env.RBAC_STRICT_ADMIN = 'false';
    // Re-require to refresh cached variables in auth.js if any, but since it evaluates inside function/closure:
    delete require.cache[require.resolve('../middleware/auth')];
    const { requireSuperAdmin: requireSuperAdminLazy } = require('../middleware/auth');

    // Run tests for lazy mode
    const runLazyTest = (role, expectedStatus) => {
        const req = { user: { role } };
        const res = mockRes();
        let nextCalled = false;
        requireSuperAdminLazy(req, res, () => { nextCalled = true; });
        if (expectedStatus === 200 && nextCalled) console.log(`  ✅ [PASS] Default Mode - Role: '${role}' -> Passed`);
        else if (res.statusCode === expectedStatus) console.log(`  ✅ [PASS] Default Mode - Role: '${role}' -> Blocked with ${expectedStatus}`);
        else console.log(`  ❌ [FAIL] Default Mode - Role: '${role}'`);
    };

    runLazyTest('admin', 200);
    runLazyTest('Admin', 200);
    runLazyTest('شريك', 200);
    runLazyTest('user', 403);

    console.log('\n--- Testing with RBAC_STRICT_ADMIN = true ---');
    process.env.RBAC_STRICT_ADMIN = 'true';
    delete require.cache[require.resolve('../middleware/auth')];
    const { requireSuperAdmin: requireSuperAdminStrict } = require('../middleware/auth');

    const runStrictTest = (role, expectedStatus) => {
        const req = { user: { role } };
        const res = mockRes();
        let nextCalled = false;
        requireSuperAdminStrict(req, res, () => { nextCalled = true; });
        if (expectedStatus === 200 && nextCalled) console.log(`  ✅ [PASS] Strict Mode - Role: '${role}' -> Passed`);
        else if (res.statusCode === expectedStatus) console.log(`  ✅ [PASS] Strict Mode - Role: '${role}' -> Blocked with ${expectedStatus}`);
        else console.log(`  ❌ [FAIL] Strict Mode - Role: '${role}'`);
    };

    runStrictTest('admin', 200);
    runStrictTest('Admin', 403);
    runStrictTest('شريك', 403);
    runStrictTest('user', 403);
}

async function testUsersNormalization() {
    console.log('\n--- 2) TESTING users.js NORMALIZATION ---');
    
    // Simulate user controller environment directly to bypass full server listeners for SPEED
    const express = require('express');
    const router = require('../routes/users');

    // Extract the POST / handler directly
    const createHandler = router.stack.find(s => s.route && s.route.path === '/' && s.route.methods.post).route.stack.slice(-1)[0].handle;

    const mockReq = (body) => ({
        body,
        user: { id: 'auditor', role: 'admin' } // Required by auditService
    });

    const mockRes = () => {
        const res = {};
        res.status = (code) => { res.statusCode = code; return res; };
        res.json = (obj) => { res.jsonObj = obj; return res; };
        return res;
    };

    // Stub out dbAsync.run to see what role hits the DB
    let recordedRole = null;
    dbAsync.run = async (sql, params) => {
        if (sql.includes('INSERT INTO users')) {
             // In route: (id, name, role, email, phone, active, password_hash...)
             // parameters map from values array
             recordedRole = params[2]; // 3rd index = role
        }
        return { changes: 1 };
    };

    // Test cases
    const testNormalize = async (inputRole, expectedRole) => {
        recordedRole = null;
        const req = mockReq({ name: 'Test', email: `test_${Math.random()}@site.com`, role: inputRole });
        const res = mockRes();
        
        await createHandler(req, res);

        if (recordedRole === expectedRole) {
            console.log(`  ✅ [PASS] Normalized input '${inputRole}' -> DB saved as '${recordedRole}'`);
        } else {
            console.log(`  ❌ [FAIL] Normalized input '${inputRole}' -> Expected '${expectedRole}', got '${recordedRole}'`);
        }
    };

    await testNormalize('Admin', 'admin');
    await testNormalize('شريك', 'admin');
    await testNormalize('محامي', 'محامي');
}

async function run() {
    await testRBAC();
    await testUsersNormalization();
    console.log('\n--- VERIFICATION FINISHED ---\n');
}

run();
