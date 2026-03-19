// Migration 3: Ensure all tables that may have been missing from manual
// schema setups are created. Uses IF NOT EXISTS so this is always safe to run.
// NOTE: No indexes here — avoids column-name casing issues with pre-existing tables.
exports.up = (pgm) => {
    // audit_logs may not exist if the DB was set up before this table was added
    pgm.createTable('audit_logs', {
        id:        { type: 'text', primaryKey: true },
        userId:    { type: 'text' },
        action:    { type: 'text' },
        entity:    { type: 'text' },
        entityId:  { type: 'text' },
        details:   { type: 'text' },
        _createdAt:{ type: 'text' },
        _deleted:  { type: 'integer', default: 0, notNull: true }
    }, { ifNotExists: true });

    // deadlines
    pgm.createTable('deadlines', {
        id:                { type: 'text', primaryKey: true },
        caseId:            { type: 'text' },
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

    // lookup_mappings
    pgm.createTable('lookup_mappings', {
        id:           { type: 'text', primaryKey: true },
        decisionType: { type: 'text', notNull: true },
        actionTypes:  { type: 'text' },
        _createdAt:   { type: 'text' },
        _updatedAt:   { type: 'text' },
        _deleted:     { type: 'integer', default: 0, notNull: true }
    }, { ifNotExists: true });

    // settings
    pgm.createTable('settings', {
        key:   { type: 'text', primaryKey: true },
        value: { type: 'text' }
    }, { ifNotExists: true });
};

exports.down = (pgm) => {
    pgm.dropTable('audit_logs',     { ifExists: true });
    pgm.dropTable('deadlines',      { ifExists: true });
    pgm.dropTable('lookup_mappings',{ ifExists: true });
    pgm.dropTable('settings',       { ifExists: true });
};
