const fs = require('fs');
const path = require('path');

const map = {
    '📊': "<i class='bx bxs-dashboard'></i>",
    '👥': "<i class='bx bxs-group'></i>",
    '📁': "<i class='bx bxs-folder-open'></i>",
    '📅': "<i class='bx bxs-calendar'></i>",
    '⚡': "<i class='bx bxs-zap'></i>",
    '⏰': "<i class='bx bxs-time'></i>",
    '⚙️': "<i class='bx bxs-cog'></i>",
    '👤': "<i class='bx bxs-user-detail'></i>",
    '📋': "<i class='bx bx-list-check'></i>",
    '🔴': "<i class='bx bxs-circle'></i>",
    '🚨': "<i class='bx bxs-bell-ring'></i>",
    '⚠️': "<i class='bx bx-error'></i>",
    '🚩': "<i class='bx bxs-flag'></i>",
    '➕': "<i class='bx bx-plus'></i>",
    '✏️': "<i class='bx bx-edit'></i>",
    '🗑️': "<i class='bx bx-trash'></i>",
    '🏛️': "<i class='bx bxs-bank'></i>"
};

function explorePath(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            explorePath(fullPath);
        } else if (fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let changed = false;
            for (const [emoji, icon] of Object.entries(map)) {
                if (content.includes(emoji)) {
                    // split and join to replace all
                    content = content.split(emoji).join(icon);
                    changed = true;
                }
            }
            if (changed) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    }
}

explorePath('./src');
console.log('Icon replacement complete.');
