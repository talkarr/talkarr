// see backend/helper/blurhash.ts for more details
import { decode, isBlurhashValid } from 'blurhash';

export const clientDecodeCustomBlurhash = (
    customBlurhash: string,
): { width: number; height: number; blurhash: string } | null => {
    const match = customBlurhash.match(/^w=(\d+);h=(\d+);d=(.+)$/);
    if (!match) {
        return null;
    }

    const width = Number.parseInt(match[1], 10);
    const height = Number.parseInt(match[2], 10);
    const blurhash = match[3];

    return { width, height, blurhash };
};

// Arguments are object to make sure only customBlurhash is passed and not the direct output of encode() function
export const extractBlurhashFromCustomFormat = ({
    customBlurhash,
}: {
    customBlurhash: string;
}): [Uint8ClampedArray, number, number] | undefined => {
    if (!customBlurhash) {
        console.error('No custom blurhash provided');
        return undefined;
    }

    const decoded = clientDecodeCustomBlurhash(customBlurhash);
    if (!decoded) {
        console.error('Invalid custom blurhash format');
        return undefined;
    }

    const { width, height, blurhash } = decoded;

    if (!isBlurhashValid(blurhash).result) {
        throw new Error('Invalid blurhash string');
    }

    return [decode(blurhash, width, height), width, height];
};

export const convertBlurhashToClientDataURL = ({
    pixels,
    width,
    height,
}: {
    pixels: Uint8ClampedArray;
    width: number;
    height: number;
}): string | undefined => {
    if (typeof document === 'undefined') {
        // Not running in a browser environment
        return undefined;
    }

    const canvasElement = document.createElement('canvas');
    canvasElement.width = width;
    canvasElement.height = height;
    const ctx = canvasElement.getContext('2d');
    if (!ctx) {
        throw new Error('Could not get canvas context');
    }
    const imageData = ctx.createImageData(width, height);
    imageData.data.set(pixels);
    ctx.putImageData(imageData, 0, 0);

    return canvasElement.toDataURL();
};

export const convertBlurhashToDataURL = ({
    customBlurhash,
}: {
    customBlurhash: string;
}): string | undefined => {
    if (!customBlurhash) {
        console.error('No custom blurhash provided');
        return undefined;
    }

    const decoded = extractBlurhashFromCustomFormat({ customBlurhash });

    if (!decoded) {
        console.error('Error decoding custom blurhash');
        return undefined;
    }

    const [pixels, width, height] = decoded;

    const isClient =
        typeof window !== 'undefined' && typeof document !== 'undefined';

    // either run client side or server side
    if (isClient) {
        return convertBlurhashToClientDataURL({ pixels, width, height });
    }

    return undefined;
};
