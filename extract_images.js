import pdfExportImages from 'pdf-export-images';

async function extract() {
    try {
        console.log('Extracting images...');
        const images = await pdfExportImages('./Saryia brand identity.pdf', 'public/pdf-images');
        console.log(`Extracted ${images.length} images.`);
    } catch (e) {
        console.error(e);
    }
}

extract();
