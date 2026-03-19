const { Pool } = require('pg');

const usePg = !!process.env.DATABASE_URL;

if (!usePg) {
    console.error('CRITICAL: DATABASE_URL is not set. The Sereya Law Firm application requires a PostgreSQL database.');
    process.exit(1);
}

const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

let dbAsync = {};

// Helper to convert queries from `?` to `$1`, `$2` etc. for Postgres
function convertQueryForPg(sql) {
    let index = 1;
    return sql.replace(/\?/g, () => '$' + index++);
}

db.on('connect', () => console.log('✅ Connected to PostgreSQL database.'));
db.on('error', (err) => console.error('❌ PostgreSQL database error:', err));

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

// Schema is strictly managed by node-pg-migrate tools now.
module.exports = { db, dbAsync };

