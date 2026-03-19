exports.up = (pgm) => {
    // Add missing fields to clients table for Google Sheets onboarding.
    // ifNotExists: true makes this safe to re-run if columns already exist.
    pgm.addColumns('clients', {
        fullNameAr:        { type: 'text' },
        powerOfAttorneyNo: { type: 'text' },
        driveLink:         { type: 'text' },
        sourceIndex:       { type: 'text' }
    }, { ifNotExists: true });
};

exports.down = (pgm) => {
    pgm.dropColumns('clients', ['fullNameAr', 'powerOfAttorneyNo', 'driveLink', 'sourceIndex']);
};
