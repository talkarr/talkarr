import * as blurhash from 'blurhash';
import { createCanvas, loadImage } from 'canvas';
import fs from 'node:fs/promises';

import rootLog from '@backend/root-log';

const log = rootLog.child({ label: 'helper/blurhash' });

export const generateBlurhashDataUrlFromBuffer = async (
    buffer: Buffer,
): Promise<string> => {
    const image = await loadImage(buffer);

    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    const blurredImage = blurhash.decode(
        blurhash.encode(
            new Uint8ClampedArray(imageData.data),
            image.width,
            image.height,
            4,
            4,
        ),
        image.width,
        image.height,
    );

    const blurredCanvas = createCanvas(image.width, image.height);
    const blurredCtx = blurredCanvas.getContext('2d');
    const blurredImageData = blurredCtx.createImageData(
        image.width,
        image.height,
    );
    blurredImageData.data.set(blurredImage);
    blurredCtx.putImageData(blurredImageData, 0, 0);

    return blurredCanvas.toDataURL('image/png');
};

export const generateBlurhashDataUrlFromFilepath = async (
    filePath: string,
): Promise<string> => {
    try {
        const buffer = await fs.readFile(filePath);
        return await generateBlurhashDataUrlFromBuffer(buffer);
    } catch (error) {
        log.error('Error reading image from filepath:', { filePath, error });
        throw error;
    }
};

export const generateBlurhashDataUrlFromUrl = async (
    url: string,
): Promise<string> => {
    try {
        const response = await fetch(url);
        const buffer = Buffer.from(await response.arrayBuffer());
        return await generateBlurhashDataUrlFromBuffer(buffer);
    } catch (error) {
        log.error('Error fetching image from URL:', { url, error });

        throw error;
    }
};
