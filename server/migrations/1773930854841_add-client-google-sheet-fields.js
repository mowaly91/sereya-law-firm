exports.up = (pgm) => {
    // Add missing fields to clients table to match the onboarding requirements
    pgm.addColumns('clients', {
        fullNameAr: { type: 'text' },
        powerOfAttorneyNo: { type: 'text' },
        driveLink: { type: 'text' },
        sourceIndex: { type: 'text' }
    });
};

exports.down = (pgm) => {
    pgm.dropColumns('clients', ['fullNameAr', 'powerOfAttorneyNo', 'driveLink', 'sourceIndex']);
};
