import { encode } from 'blurhash';
import fs from 'node:fs/promises';
import sharp from 'sharp';

import rootLog from '@backend/root-log';

const log = rootLog.child({ label: 'helper/blurhash' });

export const encodeCustomBlurhash = (
    blurhash: string,
    width: number,
    height: number,
): string => `w=${width};h=${height};d=${blurhash}`;

export const generateBlurhashFromBuffer = async (
    buffer: Buffer,
): Promise<string> => {
    // first resize image to max 100x100
    const resizedBuffer = await sharp(buffer)
        .resize(100, 100, {
            fit: 'inside',
            withoutEnlargement: true,
        })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    const { data, info } = resizedBuffer;

    if (!info.width || !info.height) {
        throw new Error('Invalid image dimensions after resize');
    }

    const blurhashencoded = encode(
        new Uint8ClampedArray(data),
        info.width,
        info.height,
        4,
        4,
    );

    return encodeCustomBlurhash(blurhashencoded, info.width, info.height);
};

export const generateBlurhashFromFilepath = async (
    filePath: string,
): Promise<string> => {
    try {
        const buffer = await fs.readFile(filePath);
        return await generateBlurhashFromBuffer(buffer);
    } catch (error) {
        log.error('Error reading image from filepath:', { filePath, error });
        throw error;
    }
};

export const generateBlurhashFromUrl = async (url: string): Promise<string> => {
    try {
        const response = await fetch(url);
        const buffer = Buffer.from(await response.arrayBuffer());
        const result = await generateBlurhashFromBuffer(buffer);

        log.info('Successfully generated blurhash from URL', {
            url,
            length: result.length,
        });
        return result;
    } catch (error) {
        log.error('Error fetching image from URL or during generation:', {
            url,
            error,
        });

        throw error;
    }
};
