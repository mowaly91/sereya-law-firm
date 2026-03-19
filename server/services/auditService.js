const { dbAsync } = require('../db');

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * Single audit logger helper (append-only)
 */
async function logAuditEvents(userId, action, entity, entityId, details = {}) {
    try {
        const id = generateId();
        const createdAt = new Date().toISOString();
        const detailsStr = typeof details === 'object' ? JSON.stringify(details) : details;

        await dbAsync.run(
            `INSERT INTO audit_logs (id, "userId", action, entity, "entityId", details, "_createdAt", _deleted) 
             VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
            [id, userId, action, entity, entityId, detailsStr, createdAt]
        );
    } catch (error) {
        // We log the error but don't crash the main transaction intentionally, 
        // to avoid breaking user flows, though strict design might require it.
        console.error('Audit Log Error:', error);
    }
}

module.exports = { logAuditEvents };
