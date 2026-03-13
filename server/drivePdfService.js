const { google } = require('googleapis');
const vision = require('@google-cloud/vision');
const fs = require('fs');
const path = require('path');

const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];

/**
 * Helper to get the parsed credentials object either from the environment variable 
 * or from the local credentials.json file.
 */
function getCredentials() {
    if (process.env.GOOGLE_CREDENTIALS) {
        try {
            return JSON.parse(process.env.GOOGLE_CREDENTIALS);
        } catch (err) {
            console.error("Failed to parse GOOGLE_CREDENTIALS from environment variable.", err);
        }
    }
    
    if (fs.existsSync(CREDENTIALS_PATH)) {
        try {
            return JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
        } catch (err) {
            console.error("Failed to read credentials.json.", err);
        }
    }
    
    return null;
}

const creds = getCredentials();

// Initialize Vision API client
let visionClient = null;
if (creds) {
    visionClient = new vision.ImageAnnotatorClient({
        credentials: {
            client_email: creds.client_email,
            private_key: creds.private_key
        }
    });
}

async function getAuth() {
    if (!creds) {
        throw new Error("Missing Google Credentials. Please provide process.env.GOOGLE_CREDENTIALS or create server/credentials.json.");
    }

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: creds.client_email,
            private_key: creds.private_key
        },
        scopes: SCOPES,
    });
    return auth;
}

/**
 * Parses a Google Drive Link to extract the Folder ID
 */
function extractFolderIdFromLink(linkOrId) {
    if (!linkOrId) return null;

    if (linkOrId.includes('drive.google.com')) {
        const folderMatch = linkOrId.match(/\/folders\/([a-zA-Z0-9-_]+)/);
        if (folderMatch) return folderMatch[1];

        const idMatch = linkOrId.match(/[?&]id=([a-zA-Z0-9-_]+)/);
        if (idMatch) return idMatch[1];
    }
    return linkOrId.trim();
}

/**
 * Extracts Client Name and National ID from a Folder title
 */
function extractDataFromTitle(title) {
    const idMatch = title.match(/(?<!\d)(\d{14})(?!\d)/);
    const nationalId = idMatch ? idMatch[1] : '';

    let name = title;
    if (nationalId) {
        name = name.replace(nationalId, '');
    }
    name = name.replace(/[-_()]/g, ' ').replace(/\s+/g, ' ').trim();

    return { name, nationalId };
}

/**
 * Downloads a file from Google Drive into a Buffer
 */
async function downloadFileFromDrive(drive, fileId) {
    try {
        const response = await drive.files.get(
            { fileId: fileId, alt: 'media' },
            { responseType: 'arraybuffer' }
        );
        return Buffer.from(response.data);
    } catch (error) {
        console.error(`Error downloading file ${fileId}:`, error);
        return null;
    }
}

/**
 * Runs Google Cloud Vision OCR on an image buffer
 */
async function performOcrOnImageBuffer(buffer) {
    if (!visionClient) return "";
    try {
        const [result] = await visionClient.documentTextDetection(buffer);
        const fullTextAnnotation = result.fullTextAnnotation;
        return fullTextAnnotation ? fullTextAnnotation.text : "";
    } catch (err) {
        console.error("OCR Error:", err);
        return "";
    }
}

/**
 * Scans a specific client sub-folder for images/PDFs and attempts to extract a 14-digit National ID using OCR.
 */
async function extractIdFromFolderContents(drive, folderId) {
    try {
        // List files in this client's folder (images and pdfs)
        const listResponse = await drive.files.list({
            q: `'${folderId}' in parents and (mimeType contains 'image/' or mimeType='application/pdf') and trashed=false`,
            fields: 'files(id, name, mimeType)',
            pageSize: 50 // Increased from 10 to 50 to ensure we find ID images in large folders
        });

        const files = listResponse.data.files || [];

        // Only look at images. Filter by likely ID keywords, or take up to 3 max.
        let imageFiles = files.filter(f => f.mimeType.startsWith('image/'));
        
        // Try to find files that match ID keywords
        const keywords = ['بطاقة', 'بطاقه', 'البطاقة', 'البطاقه', 'id', 'رقم', 'قومي', 'قومى', 'وجه', 'ظهر', 'national'];
        let likelyIdFiles = imageFiles.filter(f => keywords.some(k => f.name.toLowerCase().includes(k)));
        
        // Limit to scan up to 5 images to increase chances of finding the ID
        let filesToScan = likelyIdFiles.length > 0 ? likelyIdFiles.slice(0, 5) : imageFiles.slice(0, 5);

        for (const file of filesToScan) {
            console.log(`Downloading and OCR scanning image: ${file.name}`);
            const buffer = await downloadFileFromDrive(drive, file.id);
            if (buffer) {
                const text = await performOcrOnImageBuffer(buffer);

                // Look for 14-digit Egyptian National ID in the OCR text
                // We strip all non-numeric characters first to handle cases where OCR adds spaces or noise
                const digitsOnly = text.replace(/\D/g, '');
                const idMatch = digitsOnly.match(/\d{14}/);
                
                if (idMatch) {
                    console.log(`Successfully extracted ID: ${idMatch[0]}`);
                    return idMatch[0]; // Found it!
                }

                // Fallback: search for 14 digits in raw text in case digitsOnly stripping is too aggressive
                const rawMatch = text.match(/(?<!\d)(\d{14})(?!\d)/);
                if (rawMatch) {
                    return rawMatch[1];
                }
            }
        }
    } catch (err) {
        console.error(`Error traversing subfolder ${folderId}:`, err);
    }

    return ""; // Could not find an ID
}

/**
 * Main function: Lists items in root folder. If it's a folder, uses it as a Client.
 * Then looks inside that folder using OCR to find the National ID.
 */
async function scanDriveFolderForClients(folderLink) {
    const rootFolderId = extractFolderIdFromLink(folderLink);
    if (!rootFolderId) {
        throw new Error("Invalid Folder Link or ID provided.");
    }

    const auth = await getAuth();
    const drive = google.drive({ version: 'v3', auth });

    const listResponse = await drive.files.list({
        // Only fetch folders at the root level (since each folder = 1 client)
        q: `'${rootFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name, webViewLink)',
        pageSize: 100
    });

    const folders = listResponse.data.files || [];
    let extractedClients = [];
    
    // Process folders with a simple concurrency limit (e.g. 5 at a time)
    const CONCURRENCY_LIMIT = 5;
    
    // Chunk array helper
    const chunkArray = (arr, size) => 
        Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
            arr.slice(i * size, i * size + size)
        );

    const folderChunks = chunkArray(folders, CONCURRENCY_LIMIT);
    
    for (const chunk of folderChunks) {
        const chunkPromises = chunk.map(async (folder) => {
            const { name, nationalId: idFromTitle } = extractDataFromTitle(folder.name);
            let finalNationalId = idFromTitle;

            console.log(`Found client folder: ${name}`);

            return {
                name: name || 'غير محدد',
                nationalId: finalNationalId,
                sourceFile: folder.name,
                sourceFileId: folder.id,
                driveFolderUrl: folder.webViewLink,
                isFolder: true
            };
        });
        
        const results = await Promise.all(chunkPromises);
        extractedClients.push(...results);
    }

    return extractedClients;
}

/**
 * Sync function: takes an existing driveFolderId, looks inside it for images, runs OCR to find ID.
 */
async function syncDriveClient(folderId) {
    const auth = await getAuth();
    const drive = google.drive({ version: 'v3', auth });
    return await extractIdFromFolderContents(drive, folderId);
}

module.exports = {
    scanDriveFolderForClients,
    syncDriveClient
};
