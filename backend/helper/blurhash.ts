import fs from 'node:fs/promises';
import sharp from 'sharp';

import rootLog from '@backend/root-log';

const log = rootLog.child({ label: 'helper/blurhash' });

const maximumDimension = 64;

export const generateBlurhashDataUrlFromBuffer = async (
    buffer: Buffer,
): Promise<string> => {
    const image = sharp(buffer);

    const metadata = await image.metadata();
    const imageWidth = metadata.width;
    const imageHeight = metadata.height;

    if (!imageWidth || !imageHeight) {
        throw new Error('Invalid image dimensions');
    }

    const scale =
        imageWidth > imageHeight
            ? maximumDimension / imageWidth
            : maximumDimension / imageHeight;
    const resizedWidth = Math.round(imageWidth * scale);
    const resizedHeight = Math.round(imageHeight * scale);

    log.info('Resizing image for blurhash generation', {
        originalWidth: imageWidth,
        originalHeight: imageHeight,
        resizedWidth,
        resizedHeight,
    });

    const resizedBuffer = await sharp(buffer)
        .resize(resizedWidth, resizedHeight)
        .blur(10)
        .toBuffer();

    return `data:image/png;base64,${resizedBuffer.toString('base64')}`;
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
        const result = await generateBlurhashDataUrlFromBuffer(buffer);

        log.info('Successfully generated blurhash from URL', {
            url,
            length: result.length,
        });
        return result;
    } catch (error) {
        log.error('Error fetching image from URL:', { url, error });

        throw error;
    }
};
