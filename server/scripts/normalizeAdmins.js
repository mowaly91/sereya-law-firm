const { db } = require('../db');

/**
 * One-time execution script to normalize legacy super-admin roles 
 * into a single canonical 'admin' string.
 * This is safe, idempotent, and updates the timestamp of the modified rows.
 */
async function run() {
    try {
        console.log('Starting Admin Role Normalization...');
        
        const now = new Date().toISOString();
        const res = await db.query(`
            UPDATE users 
            SET role = 'admin', "_updatedAt" = $1
            WHERE role IN ('Admin', 'شريك')
        `, [now]);
        
        console.log(`Successfully normalized ${res.rowCount} users to lowercase 'admin'.`);
    } catch (err) {
        console.error('Error during admin normalization:', err);
    } finally {
        await db.end();
        process.exit(0);
    }
}

run();
