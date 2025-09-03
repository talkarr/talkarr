// see backend/helper/blurhash.ts for more details
import { decode, isBlurhashValid } from 'blurhash';

export const decodeCustomBlurhash = (
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
export const generateDataUrlFromBlurhashOnClientSide = ({
    customBlurhash,
}: {
    customBlurhash: string;
}): string | undefined => {
    if (!customBlurhash) {
        console.error('No custom blurhash provided');
        return undefined;
    }

    if (typeof document === 'undefined') {
        // Not running in a browser environment
        return undefined;
    }

    const decoded = decodeCustomBlurhash(customBlurhash);
    if (!decoded) {
        console.error('Invalid custom blurhash format');
        return undefined;
    }

    const { width, height, blurhash } = decoded;

    if (!isBlurhashValid(blurhash).result) {
        throw new Error('Invalid blurhash string');
    }

    const pixels = decode(blurhash, width, height);

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
