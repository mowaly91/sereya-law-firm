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

// ── Column name normalizer ────────────────────────────────────────────────────
// PostgreSQL folds unquoted identifiers to lowercase.
// If the original schema was created with camelCase column names (no quotes),
// SELECT * returns them all-lowercase. We map them back to camelCase here
// so all routes and the frontend receive consistent key names.
//
// All known camelCase fields across every table:
const CAMEL_FIELDS = [
    // shared
    '_createdAt', '_updatedAt',
    // users
    'passwordHash', 'inviteToken', 'inviteTokenExpires',
    // cases
    'caseNo', 'stageType', 'clientId', 'clientIds', 'primaryClientId',
    'clientRole', 'opponentName', 'opponentRole', 'caseType',
    'firstSessionDate', 'ownerId', 'criminalStageType', 'linkedProsecutionId',
    // sessions
    'caseId', 'sessionType', 'decisionResult', 'nextSessionDate',
    'closureReason',
    // actions
    'actionType', 'responsibleUserId', 'executionDate', 'executionDetails',
    'subTasks', 'dueDate',
    // deadlines
    'deadlineType', 'startDate', 'endDate', 'completionNote',
    // clients
    'nationalId', 'poaNumber', 'notaryOffice', 'poaDate',
    'driveFolderUrl', 'driveFolderId',
    'fullNameAr', 'powerOfAttorneyNo', 'driveLink', 'sourceIndex',
    // audit_logs
    'userId', 'entityId',
    // lookup_mappings
    'decisionType', 'actionTypes',
];

// Build a lookup: lowercase → original camelCase
const LOWER_TO_CAMEL = {};
CAMEL_FIELDS.forEach(f => { LOWER_TO_CAMEL[f.toLowerCase()] = f; });

function normalizeRow(row) {
    if (!row || typeof row !== 'object') return row;
    const out = {};
    for (const [key, val] of Object.entries(row)) {
        const mapped = LOWER_TO_CAMEL[key.toLowerCase()] || key;
        out[mapped] = val;
    }
    return out;
}

db.on('connect', () => console.log('✅ Connected to PostgreSQL database.'));
db.on('error', (err) => console.error('❌ PostgreSQL database error:', err));

dbAsync.get = async (sql, params = []) => {
    const res = await db.query(convertQueryForPg(sql), params);
    return normalizeRow(res.rows[0]);
};
dbAsync.all = async (sql, params = []) => {
    const res = await db.query(convertQueryForPg(sql), params);
    return res.rows.map(normalizeRow);
};
dbAsync.run = async (sql, params = []) => {
    const res = await db.query(convertQueryForPg(sql), params);
    return { changes: res.rowCount };
};

// Schema is strictly managed by node-pg-migrate tools now.
module.exports = { db, dbAsync };
