import sharp from 'sharp';
async function test() {
    try {
        const { data, info } = await sharp('public/logo-center.png').raw().toBuffer({ resolveWithObject: true });
        console.log('Top-left pixel RGB:', data[0], data[1], data[2]);
    } catch (e) { console.error(e); }
}
test();
