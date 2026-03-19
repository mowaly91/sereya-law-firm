const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log("Adding new Google Sheets import columns to clients table...");

db.serialize(() => {
    db.run("ALTER TABLE clients ADD COLUMN fullNameAr TEXT;", (err) => {
        if (err) console.log("fullNameAr already exists or error:", err.message);
        else console.log("Added fullNameAr column");
    });
    db.run("ALTER TABLE clients ADD COLUMN powerOfAttorneyNo TEXT;", (err) => {
        if (err) console.log("powerOfAttorneyNo already exists or error:", err.message);
        else console.log("Added powerOfAttorneyNo column");
    });
    db.run("ALTER TABLE clients ADD COLUMN driveLink TEXT;", (err) => {
        if (err) console.log("driveLink already exists or error:", err.message);
        else console.log("Added driveLink column");
    });
    db.run("ALTER TABLE clients ADD COLUMN sourceIndex TEXT;", (err) => {
        if (err) console.log("sourceIndex already exists or error:", err.message);
        else console.log("Added sourceIndex column");
    });
});

db.close(() => {
    console.log("Done updating schema for Google Sheets.");
});
