import sharp from 'sharp';

async function cropLogo() {
    try {
        console.log('Cropping logo from page 1...');
        const image = sharp('public/pdf-images/img_p0_1.png');
        const metadata = await image.metadata();

        // We'll crop the center region
        await image.clone().extract({
            left: Math.floor(metadata.width / 2 - 300),
            top: Math.floor(metadata.height / 2 - 300),
            width: 600,
            height: 600
        }).toFile('public/logo-center.png');

        // And top-center region
        await image.clone().extract({
            left: Math.floor(metadata.width / 2 - 300),
            top: 50,
            width: 600,
            height: 300
        }).toFile('public/logo-topcenter.png');

        console.log('Cropped logos generated.');
    } catch (e) {
        console.error(e);
    }
}

cropLogo();
