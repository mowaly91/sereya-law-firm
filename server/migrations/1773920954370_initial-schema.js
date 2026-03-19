exports.up = (pgm) => {
    // All tables use ifNotExists: true so this migration is safe to run
    // even against a DB that was set up manually before migrations existed.

    pgm.createTable('users', {
        id: { type: 'text', primaryKey: true },
        name: { type: 'text', notNull: false },
        role: { type: 'text', notNull: false },
        email: { type: 'text', notNull: true, unique: true },
        phone: { type: 'text' },
        active: { type: 'integer', default: 1 },
        password_hash: { type: 'text', notNull: true },
        invite_token: { type: 'text' },
        invite_token_expires: { type: 'text' },
        _createdAt: { type: 'text' },
        _updatedAt: { type: 'text' },
        _deleted: { type: 'integer', default: 0, notNull: true }
    }, { ifNotExists: true });
    pgm.createIndex('users', 'email', { ifNotExists: true });
    pgm.createIndex('users', 'role', { ifNotExists: true });

    pgm.createTable('clients', {
        id: { type: 'text', primaryKey: true },
        name: { type: 'text', notNull: true },
        nationalId: { type: 'text', unique: true },
        phone: { type: 'text' },
        address: { type: 'text' },
        poaNumber: { type: 'text' },
        notaryOffice: { type: 'text' },
        poaDate: { type: 'text' },
        attachments: { type: 'text' },
        notes: { type: 'text' },
        driveFolderUrl: { type: 'text' },
        driveFolderId: { type: 'text' },
        _createdAt: { type: 'text' },
        _updatedAt: { type: 'text' },
        _deleted: { type: 'integer', default: 0, notNull: true }
    }, { ifNotExists: true });
    pgm.createIndex('clients', 'nationalId', { ifNotExists: true });
    pgm.createIndex('clients', 'name', { ifNotExists: true });

    pgm.createTable('cases', {
        id: { type: 'text', primaryKey: true },
        caseNo: { type: 'text', notNull: true },
        year: { type: 'text' },
        stageType: { type: 'text' },
        clientId: { type: 'text', references: '"clients"', onDelete: 'CASCADE' },
        clientIds: { type: 'text' },
        primaryClientId: { type: 'text' },
        clientRole: { type: 'text' },
        opponentName: { type: 'text' },
        opponentRole: { type: 'text' },
        court: { type: 'text', notNull: true },
        circuit: { type: 'text' },
        caseType: { type: 'text' },
        subject: { type: 'text' },
        firstSessionDate: { type: 'text' },
        ownerId: { type: 'text' },
        status: { type: 'text' },
        criminalStageType: { type: 'text' },
        linkedProsecutionId: { type: 'text' },
        notes: { type: 'text' },
        _createdAt: { type: 'text' },
        _updatedAt: { type: 'text' },
        _deleted: { type: 'integer', default: 0, notNull: true }
    }, { ifNotExists: true });
    pgm.createIndex('cases', 'clientId', { ifNotExists: true });
    pgm.createIndex('cases', 'status', { ifNotExists: true });

    pgm.createTable('sessions', {
        id: { type: 'text', primaryKey: true },
        caseId: { type: 'text', notNull: true, references: '"cases"', onDelete: 'CASCADE' },
        date: { type: 'text', notNull: true },
        sessionType: { type: 'text' },
        decisionResult: { type: 'text' },
        nextSessionDate: { type: 'text' },
        status: { type: 'text' },
        closureReason: { type: 'text' },
        notes: { type: 'text' },
        attachments: { type: 'text' },
        _createdAt: { type: 'text' },
        _updatedAt: { type: 'text' },
        _deleted: { type: 'integer', default: 0, notNull: true }
    }, { ifNotExists: true });
    pgm.createIndex('sessions', 'caseId', { ifNotExists: true });
    pgm.createIndex('sessions', 'date', { ifNotExists: true });

    pgm.createTable('actions', {
        id: { type: 'text', primaryKey: true },
        clientId: { type: 'text', references: '"clients"', onDelete: 'CASCADE' },
        caseId: { type: 'text', references: '"cases"', onDelete: 'CASCADE' },
        sessionId: { type: 'text' },
        actionType: { type: 'text' },
        title: { type: 'text' },
        priority: { type: 'text' },
        responsibleUserId: { type: 'text' },
        status: { type: 'text', notNull: true },
        executionDate: { type: 'text' },
        executionDetails: { type: 'text' },
        subTasks: { type: 'text' },
        dueDate: { type: 'text' },
        notes: { type: 'text' },
        attachments: { type: 'text' },
        _createdAt: { type: 'text' },
        _updatedAt: { type: 'text' },
        _deleted: { type: 'integer', default: 0, notNull: true }
    }, { ifNotExists: true });
    pgm.createIndex('actions', 'caseId', { ifNotExists: true });
    pgm.createIndex('actions', 'status', { ifNotExists: true });
    pgm.createIndex('actions', 'responsibleUserId', { ifNotExists: true });

    pgm.createTable('deadlines', {
        id: { type: 'text', primaryKey: true },
        caseId: { type: 'text', references: '"cases"', onDelete: 'CASCADE' },
        deadlineType: { type: 'text' },
        startDate: { type: 'text' },
        endDate: { type: 'text', notNull: true },
        responsibleUserId: { type: 'text' },
        status: { type: 'text' },
        completionNote: { type: 'text' },
        _createdAt: { type: 'text' },
        _updatedAt: { type: 'text' },
        _deleted: { type: 'integer', default: 0, notNull: true }
    }, { ifNotExists: true });
    pgm.createIndex('deadlines', 'endDate', { ifNotExists: true });

    pgm.createTable('lookup_mappings', {
        id: { type: 'text', primaryKey: true },
        decisionType: { type: 'text', notNull: true, unique: true },
        actionTypes: { type: 'text' },
        _createdAt: { type: 'text' },
        _updatedAt: { type: 'text' },
        _deleted: { type: 'integer', default: 0, notNull: true }
    }, { ifNotExists: true });
    pgm.createIndex('lookup_mappings', 'decisionType', { ifNotExists: true });

    pgm.createTable('settings', {
        key: { type: 'text', primaryKey: true },
        value: { type: 'text' }
    }, { ifNotExists: true });

    pgm.createTable('audit_logs', {
        id: { type: 'text', primaryKey: true },
        userId: { type: 'text', references: '"users"', onDelete: 'CASCADE' },
        action: { type: 'text' },
        entity: { type: 'text' },
        entityId: { type: 'text' },
        details: { type: 'text' },
        _createdAt: { type: 'text' },
        _deleted: { type: 'integer', default: 0, notNull: true }
    }, { ifNotExists: true });
    pgm.createIndex('audit_logs', 'userId', { ifNotExists: true });
    pgm.createIndex('audit_logs', ['entity', 'entityId'], { ifNotExists: true });
};

exports.down = (pgm) => {
    pgm.dropTable('audit_logs');
    pgm.dropTable('settings');
    pgm.dropTable('lookup_mappings');
    pgm.dropTable('deadlines');
    pgm.dropTable('actions');
    pgm.dropTable('sessions');
    pgm.dropTable('cases');
    pgm.dropTable('clients');
    pgm.dropTable('users');
};
