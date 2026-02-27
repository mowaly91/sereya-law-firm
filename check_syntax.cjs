const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function checkSyntax(dir) {
    let errors = 0;
    function explore(currentDir) {
        const files = fs.readdirSync(currentDir);
        for (const file of files) {
            const fullPath = path.join(currentDir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                explore(fullPath);
            } else if (fullPath.endsWith('.js')) {
                try {
                    execSync(`node -c "${fullPath}"`, { stdio: 'ignore' });
                } catch (e) {
                    console.error(`Syntax error in: ${fullPath}`);
                    errors++;
                }
            }
        }
    }
    explore(dir);
    if (errors === 0) console.log('All JS files passed syntax check.');
}

checkSyntax('./src');
