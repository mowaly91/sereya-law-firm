const { spawn, execSync } = require('child_process');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('--- 1. Verification of schema: audit_logs ---');
const db = new sqlite3.Database(path.resolve(__dirname, 'database.sqlite'));
db.get("SELECT sql FROM sqlite_master WHERE name='audit_logs'", (err, row) => {
    if (err) console.error(err);
    else console.log(row.sql);
    
    console.log('\n--- 2. Starting server to verify GET /api/audit ---');
    const srv = spawn('node', ['server.js'], { cwd: __dirname });
    let token = '';

    srv.stdout.on('data', data => {
        if (data.toString().includes('is running')) {
            console.log('Server started. Acquiring super-admin token...');
            try {
                const loginRes = execSync('curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\\"email\\":\\"ahmed@serya.law\\",\\"password\\":\\"Serya@2026\\"}"');
                const loginData = JSON.parse(loginRes.toString());
                token = loginData.token;
                
                console.log('\nExecuting curl for GET /api/audit:');
                console.log(`curl -i -H "Authorization: Bearer <TOKEN>" http://localhost:3000/api/audit`);
                
                const auditRes = execSync(`curl -i -s -H "Authorization: Bearer ${token}" http://localhost:3000/api/audit`);
                console.log('\nResponse Output:\n' + auditRes.toString());
                
                srv.kill();
                process.exit(0);
            } catch (err) {
                console.error(err.toString());
                srv.kill();
                process.exit(1);
            }
        }
    });

    setTimeout(() => {
        srv.kill();
        process.exit(1);
    }, 5000);
});
