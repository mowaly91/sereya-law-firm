const { google } = require('googleapis');
const { dbAsync } = require('../db');
const { logAuditEvents } = require('./auditService');

function getCredentials() {
    const credsStr = process.env.GOOGLE_SHEETS_CREDENTIALS || process.env.GOOGLE_CREDENTIALS;
    if (!credsStr) {
        throw new Error('Missing Google Credentials. Set GOOGLE_SHEETS_CREDENTIALS or GOOGLE_CREDENTIALS.');
    }
    return JSON.parse(credsStr);
}

function extractSheetId(urlOrId) {
    if (urlOrId.includes('docs.google.com')) {
        const match = urlOrId.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (match && match[1]) return match[1];
    }
    return urlOrId;
}

const HEADERS = {
    INDEX: 'الفهرس',
    NAME: 'اسم الموكل',
    PHONE: 'الهاتف',
    NID: 'الرقم القومى',
    POA: 'رقم التوكيل',
    OFFICE: 'مكتب التوثيق',
    DRIVE: 'drive link'
};

async function fetchSheetData(sheetUrlOrId, tabName, range) {
    const credentials = getCredentials();
    const scopes = (process.env.GOOGLE_SHEETS_SCOPES || 'https://www.googleapis.com/auth/spreadsheets.readonly').split(',');
    const auth = new google.auth.GoogleAuth({ credentials, scopes });
    const sheets = google.sheets({ version: 'v4', auth });
    
    const spreadsheetId = extractSheetId(sheetUrlOrId);
    let fullRange = '';
    if (tabName && range) fullRange = `'${tabName}'!${range}`;
    else if (tabName) fullRange = `'${tabName}'`;
    else if (range) fullRange = range;
    else {
        const meta = await sheets.spreadsheets.get({ spreadsheetId });
        const firstTab = meta.data.sheets[0].properties.title;
        fullRange = `'${firstTab}'`;
    }

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: fullRange,
    });
    return response.data.values || [];
}

async function previewSheet(sheetUrlOrId, tabName = '', range = '') {
    const rows = await fetchSheetData(sheetUrlOrId, tabName, range);
    if (rows.length < 2) {
        throw new Error('Sheet is empty or has only headers.');
    }

    const headerRow = rows[0].map(h => typeof h === 'string' ? h.trim() : h);
    
    // Validate exact Arabic headers
    const requiredHeaders = [HEADERS.NAME, HEADERS.NID]; // According to rules, POA might be required or NOT. The prompt: "رقم التوكيل required (unless business rules say optional)". I'll make it required.
    for (const reqH of requiredHeaders) {
        if (!headerRow.includes(reqH)) {
            throw new Error(`Missing required exact header: ${reqH}`);
        }
    }

    const validRows = [];
    const invalidRows = [];
    const conflicts = [];
    const knownNids = new Set();
    const nidToRowMap = new Map();

    const idxName = headerRow.indexOf(HEADERS.NAME);
    const idxNid = headerRow.indexOf(HEADERS.NID);
    const idxPhone = headerRow.indexOf(HEADERS.PHONE);
    const idxPoa = headerRow.indexOf(HEADERS.POA);
    const idxOffice = headerRow.indexOf(HEADERS.OFFICE);
    const idxDrive = headerRow.indexOf(HEADERS.DRIVE);
    const idxIndex = headerRow.indexOf(HEADERS.INDEX);

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = i + 1;
        const errors = [];
        
        const rawName = idxName >= 0 && row[idxName] ? row[idxName].trim() : '';
        const rawNid = idxNid >= 0 && row[idxNid] ? row[idxNid].trim() : '';
        const rawPoa = idxPoa >= 0 && row[idxPoa] ? row[idxPoa].trim() : '';
        const rawDrive = idxDrive >= 0 && row[idxDrive] ? row[idxDrive].trim() : '';
        const rawPhone = idxPhone >= 0 && row[idxPhone] ? row[idxPhone].trim() : '';
        const rawOffice = idxOffice >= 0 && row[idxOffice] ? row[idxOffice].trim() : '';
        const rawIndex = idxIndex >= 0 && row[idxIndex] ? row[idxIndex].trim() : '';

        if (!rawName) errors.push('اسم الموكل required');
        
        if (!rawNid) {
            errors.push('الرقم القومى required');
        } else if (!/^\d{14}$/.test(rawNid)) {
            errors.push('الرقم القومى يجب أن يكون 14 رقماً فقط');
        }

        if (!rawPoa && idxPoa >= 0) {
            errors.push('رقم التوكيل required');
        }

        if (rawDrive && !/^https?:\/\//i.test(rawDrive)) {
            errors.push('drive link يجب أن يكون رابطاً صحيحاً');
        }

        if (rawNid && errors.length === 0) {
            if (knownNids.has(rawNid)) {
                errors.push('الرقم القومى مكرر في الملف (صف ' + nidToRowMap.get(rawNid) + ')');
            } else {
                knownNids.add(rawNid);
                nidToRowMap.set(rawNid, rowNumber);
            }
        }

        const mappedObj = {
            name: rawName,
            nationalId: rawNid,
            fullNameAr: rawName,
            poaNumber: rawPoa,
            powerOfAttorneyNo: rawPoa,
            notaryOffice: rawOffice,
            phone: rawPhone,
            driveLink: rawDrive,
            sourceIndex: rawIndex
        };

        if (errors.length > 0) {
            invalidRows.push({ rowNumber, rawRow: row, errors });
        } else {
            validRows.push({ rowNumber, data: mappedObj });
        }
    }

    if (validRows.length > 0) {
        const nids = validRows.map(r => r.data.nationalId).filter(Boolean);
        const placeholders = nids.map(() => '?').join(',');
        
        // Check for conflicts in DB
        const existingClients = await dbAsync.all(`SELECT id, nationalId FROM clients WHERE nationalId IN (${placeholders}) AND _deleted = 0`, nids);
        
        const existingMap = {};
        existingClients.forEach(c => { existingMap[c.nationalId] = c.id; });

        for (const r of validRows) {
            if (existingMap[r.data.nationalId]) {
                conflicts.push({
                    rowNumber: r.rowNumber,
                    nationalId: r.data.nationalId,
                    existingClientId: existingMap[r.data.nationalId]
                });
            }
        }
    }

    return { validRows, invalidRows, conflicts };
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Function to mask national ID for audit log
function maskId(nid) {
    if (!nid || nid.length < 8) return '***';
    return nid.substring(0, 3) + '********' + nid.substring(11);
}

async function commitData(importRequest, userId) {
    const { rows, mode } = importRequest; // mode could be "upsert" or custom
    const results = { created: 0, updated: 0, skipped: 0, errors: [] };
    
    // Emit general audit
    await logAuditEvents(userId, 'CLIENT_IMPORT_COMMITTED', 'System', 'Batch', { message: `Importing ${rows.length} rows, mode: ${mode}` });

    for (const row of rows) {
        try {
            const rowData = row.data;
            const action = row.action || mode; // if front-end specifies per-row action, use it
            if (action === 'skip') {
                results.skipped++;
                continue;
            }

            const existing = await dbAsync.get(`SELECT * FROM clients WHERE nationalId = ? AND _deleted = 0`, [rowData.nationalId]);

            const now = new Date().toISOString();

            if (existing) {
                if (action === 'update' || action === 'upsert') {
                    // Update allowed fields
                    await dbAsync.run(
                        `UPDATE clients SET
                             name = ?,
                             fullNameAr = ?,
                             poaNumber = ?,
                             powerOfAttorneyNo = ?,
                             notaryOffice = ?,
                             phone = ?,
                             driveLink = ?,
                             sourceIndex = ?,
                             _updatedAt = ?
                         WHERE id = ?`,
                        [
                            rowData.name, rowData.fullNameAr, rowData.poaNumber, rowData.powerOfAttorneyNo,
                            rowData.notaryOffice, rowData.phone, rowData.driveLink, rowData.sourceIndex,
                            now, existing.id
                        ]
                    );
                    results.updated++;
                    await logAuditEvents(userId, 'CLIENT_UPDATED', 'clients', existing.id, { nationalId: maskId(rowData.nationalId), source: 'sheet_import' });
                } else {
                    results.skipped++;
                }
            } else {
                if (action === 'create' || action === 'upsert') {
                    const id = generateId();
                    await dbAsync.run(
                        `INSERT INTO clients (
                            id, name, nationalId, fullNameAr, poaNumber, powerOfAttorneyNo, 
                            notaryOffice, phone, driveLink, sourceIndex, _createdAt, _updatedAt, _deleted
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
                        [
                            id, rowData.name, rowData.nationalId, rowData.fullNameAr, rowData.poaNumber, rowData.powerOfAttorneyNo,
                            rowData.notaryOffice, rowData.phone, rowData.driveLink, rowData.sourceIndex, now, now
                        ]
                    );
                    results.created++;
                    await logAuditEvents(userId, 'CLIENT_CREATED', 'clients', id, { nationalId: maskId(rowData.nationalId), source: 'sheet_import' });
                } else {
                    results.skipped++;
                }
            }
        } catch (error) {
            console.error(error);
            if (error.code === '23505' || String(error.message).includes('UNIQUE')) {
                results.errors.push({ rowNumber: row.rowNumber, error: 'تعارض فريد (الرقم القومي موجود)' });
            } else {
                results.errors.push({ rowNumber: row.rowNumber, error: error.message });
            }
        }
    }
    
    return results;
}

module.exports = {
    previewSheet,
    commitData
};
