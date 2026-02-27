const { exportImages } = require('pdf-export-images/legacy');

async function extract() {
    try {
        console.log('Extracting images...');
        const images = await exportImages('./Saryia brand identity.pdf', 'public/pdf-images');
        console.log(`Extracted ${images.length} images.`);
    } catch (e) {
        console.error(e);
    }
}

extract();
