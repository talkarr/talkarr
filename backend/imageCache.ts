import fs from 'node:fs';
import path from 'path';

import { configDirectory } from '@backend/env';
import rootLog from '@backend/rootLog';
import { libravatarDomain } from '@backend/users';

const log = rootLog.child({ label: 'imageCache' });

export const imageCacheDirectory = path.join(
    configDirectory,
    'cache',
    'images',
);
export const defaultCacheDuration = 1000 * 60 * 60 * 24; // 24 hours
export const validDomains = ['static.media.ccc.de', libravatarDomain] as const;

// returns the path to the cached image or null if not found
export const getCachedImageFromUrl = async ({
    url,
    cacheKey,
    cacheDuration: cacheDurationFromArgs = defaultCacheDuration,
}: {
    url: string;
    cacheKey: string;
    // in milliseconds
    cacheDuration?: number;
}): Promise<{
    cachePathOnFs: string;
    // remaining cache duration in milliseconds
    remainingCacheDuration: number;
} | null> => {
    if (!url) {
        log.error('URL is required to get cached image.');
        return null;
    }

    if (!cacheKey) {
        log.error('Cache key is required to get cached image.');
        return null;
    }

    // check if the URL is from a valid domain
    const urlObj = new URL(url);
    if (!validDomains.includes(urlObj.hostname)) {
        log.error(`Invalid domain in URL: ${url}`);
        return null;
    }

    let cacheDuration = cacheDurationFromArgs || defaultCacheDuration;

    if (!cacheDurationFromArgs || cacheDurationFromArgs <= 0) {
        log.warn(
            `Invalid cache duration: ${cacheDurationFromArgs}. Using default duration of ${defaultCacheDuration} ms.`,
        );
        cacheDuration = defaultCacheDuration;
    }

    if (!/^https?:\/\//.test(url)) {
        log.error(`Invalid URL: ${url}. Must start with http:// or https://`);
        return null;
    }

    const cacheFilePath = path.join(imageCacheDirectory, cacheKey);

    try {
        const stats = await fs.promises.stat(cacheFilePath);

        const now = Date.now();
        const fileAge = now - stats.mtimeMs;

        if (fileAge > cacheDuration) {
            log.debug(`Cached image for ${url} is expired, fetching new one.`);
            throw new Error('Cache expired');
        }

        log.debug(`Returning cached image for ${url}`);
        return {
            cachePathOnFs: cacheFilePath,
            remainingCacheDuration: cacheDuration - fileAge,
        };
    } catch (err) {
        log.debug(`Cached image not found for ${url}, fetching...`, { err });
    }

    try {
        const response = await fetch(url);

        if (!response.ok) {
            log.warn(
                `Failed to fetch image from ${url}, resolving to original url`,
                {
                    status: response.status,
                    statusText: response.statusText,
                },
            );
            return null;
        }

        const buffer = Buffer.from(await response.arrayBuffer());
        await fs.promises.mkdir(imageCacheDirectory, { recursive: true });
        await fs.promises.writeFile(cacheFilePath, buffer);

        log.info(`Image cached successfully for ${url}`);
        return {
            cachePathOnFs: cacheFilePath,
            remainingCacheDuration: cacheDuration,
        };
    } catch (err) {
        log.error(
            `Error fetching or caching image from ${url}, resolving to original url`,
            { err },
        );
        return null;
    }
};
