const bcrypt = require('bcryptjs');
const { dbAsync } = require('../db'); // we can just use our db wrapper
const usePg = !!process.env.DATABASE_URL;

async function seedInitialUser() {
    try {
        console.log('Seeding initial admin user...');

        // Check if users exist
        let countRow;
        if (usePg) {
            countRow = await dbAsync.get('SELECT COUNT(*) as count FROM users WHERE _deleted = 0');
        } else {
            console.error('Seed script meant for production PostgreSQL DB only.');
            process.exit(1);
        }

        const count = parseInt(countRow.count, 10);
        if (count > 0) {
            console.log('✅ Admin user already seeded or users exist. Skipping.');
            process.exit(0);
        }

        const id = 'admin_' + Date.now().toString(36);
        const email = process.env.INIT_ADMIN_EMAIL;
        const rawPassword = process.env.INIT_ADMIN_PASSWORD;

        if (!email || !rawPassword) {
            console.error('ERROR: INIT_ADMIN_EMAIL and INIT_ADMIN_PASSWORD environment variables are required.');
            process.exit(1);
        }
        
        console.log(`Setting up super-admin with email: ${email}`);

        const passwordHash = await bcrypt.hash(rawPassword, 12);
        
        // Using the strictly normalized 'admin' role
        await dbAsync.run(
            `INSERT INTO users (id, name, role, email, active, password_hash, _createdAt, _updatedAt, _deleted) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
                id, 
                'Admin', 
                'admin', // Canonical admin role
                email, 
                1, 
                passwordHash, 
                new Date().toISOString(), 
                new Date().toISOString(), 
                0
            ]
        );
        console.log(`✅ Initial admin user created securely.`);
        process.exit(0);
    } catch (err) {
        console.error('Error seeding user:', err);
        process.exit(1);
    }
}

seedInitialUser();
