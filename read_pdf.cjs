const fs = require('fs');

async function run() {
    const pdfParse = (await import('pdf-parse')).default;
    const dataBuffer = fs.readFileSync('Saryia brand identity.pdf');
    const data = await pdfParse(dataBuffer);
    console.log(data.text);
}
run().catch(console.error);
