// Migration 3: Ensure all tables that may have been missing from manual
// schema setups are created. Uses IF NOT EXISTS so this is always safe to run.
exports.up = (pgm) => {
    // audit_logs may not exist if the DB was set up before this table was added
    pgm.createTable('audit_logs', {
        id:        { type: 'text', primaryKey: true },
        userId:    { type: 'text', references: '"users"', onDelete: 'CASCADE' },
        action:    { type: 'text' },
        entity:    { type: 'text' },
        entityId:  { type: 'text' },
        details:   { type: 'text' },
        _createdAt:{ type: 'text' },
        _deleted:  { type: 'integer', default: 0, notNull: true }
    }, { ifNotExists: true });
    pgm.createIndex('audit_logs', 'userId',              { ifNotExists: true });
    pgm.createIndex('audit_logs', ['entity', 'entityId'],{ ifNotExists: true });

    // deadlines may also be missing from older manual setups
    pgm.createTable('deadlines', {
        id:                { type: 'text', primaryKey: true },
        caseId:            { type: 'text', references: '"cases"', onDelete: 'CASCADE' },
        deadlineType:      { type: 'text' },
        startDate:         { type: 'text' },
        endDate:           { type: 'text', notNull: true },
        responsibleUserId: { type: 'text' },
        status:            { type: 'text' },
        completionNote:    { type: 'text' },
        _createdAt:        { type: 'text' },
        _updatedAt:        { type: 'text' },
        _deleted:          { type: 'integer', default: 0, notNull: true }
    }, { ifNotExists: true });
    pgm.createIndex('deadlines', 'endDate', { ifNotExists: true });

    // lookup_mappings
    pgm.createTable('lookup_mappings', {
        id:           { type: 'text', primaryKey: true },
        decisionType: { type: 'text', notNull: true, unique: true },
        actionTypes:  { type: 'text' },
        _createdAt:   { type: 'text' },
        _updatedAt:   { type: 'text' },
        _deleted:     { type: 'integer', default: 0, notNull: true }
    }, { ifNotExists: true });
    pgm.createIndex('lookup_mappings', 'decisionType', { ifNotExists: true });

    // settings
    pgm.createTable('settings', {
        key:   { type: 'text', primaryKey: true },
        value: { type: 'text' }
    }, { ifNotExists: true });
};

exports.down = (pgm) => {
    pgm.dropTable('audit_logs',    { ifExists: true });
    pgm.dropTable('deadlines',     { ifExists: true });
    pgm.dropTable('lookup_mappings',{ ifExists: true });
    pgm.dropTable('settings',      { ifExists: true });
};
