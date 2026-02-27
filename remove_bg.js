import sharp from 'sharp';

async function removeBg(input, output) {
    try {
        const { data, info } = await sharp(input)
            .raw()
            .toBuffer({ resolveWithObject: true });

        const newData = Buffer.alloc(info.width * info.height * 4);
        // Oxford blue roughly rgb(17, 44, 74) based on our check
        const targetR = 17, targetG = 44, targetB = 74;
        const tolerance = 80;

        for (let i = 0; i < info.width * info.height; i++) {
            let r = data[i * info.channels];
            let g = data[i * info.channels + 1];
            let b = data[i * info.channels + 2];

            const dist = Math.sqrt(
                (r - targetR) ** 2 + (g - targetG) ** 2 + (b - targetB) ** 2
            );

            let alpha = 255;
            if (dist < tolerance) {
                // Smooth fade out
                alpha = Math.floor((dist / tolerance) * 255);
                if (alpha < 30) alpha = 0; // Completely transparent for close matches

                // Anti-aliasing fringe removal: push the semi-transparent pixels toward the gold color
                // to avoid dark blue halos around the logo text
                if (alpha > 0 && alpha < 255) {
                    r = Math.min(255, r + 50);
                    g = Math.min(255, g + 40);
                    b = Math.min(255, b + 10);
                }
            }

            newData[i * 4] = r;
            newData[i * 4 + 1] = g;
            newData[i * 4 + 2] = b;
            newData[i * 4 + 3] = alpha;
        }

        await sharp(newData, {
            raw: {
                width: info.width,
                height: info.height,
                channels: 4
            }
        })
            .png()
            .toFile(output);

        console.log(`Saved transparent logo to ${output}`);
    } catch (err) {
        console.error(`Error processing ${input}:`, err);
    }
}

async function main() {
    await removeBg('public/logo-center.png', 'public/logo-transparent.png');
    await removeBg('public/logo-topcenter.png', 'public/logo-top-transparent.png');
}

main();
