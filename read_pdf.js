import fs from 'fs';
import * as pdfParseModule from 'pdf-parse';

const pdfParse = pdfParseModule.default || pdfParseModule;

const dataBuffer = fs.readFileSync('Saryia brand identity.pdf');
pdfParse(dataBuffer).then(function (data) {
    console.log(data.text);
}).catch(console.error);
