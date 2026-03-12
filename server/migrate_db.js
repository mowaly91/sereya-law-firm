const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log("Adding columns to clients table...");

db.serialize(() => {
    db.run("ALTER TABLE clients ADD COLUMN driveFolderUrl TEXT;", (err) => {
        if (err) console.log("driveFolderUrl already exists or error:", err.message);
        else console.log("Added driveFolderUrl column");
    });
    db.run("ALTER TABLE clients ADD COLUMN driveFolderId TEXT;", (err) => {
        if (err) console.log("driveFolderId already exists or error:", err.message);
        else console.log("Added driveFolderId column");
    });
});

db.close(() => {
    console.log("Done updating schema.");
});
