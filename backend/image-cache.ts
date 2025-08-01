import fs from 'node:fs';
import path from 'node:path';

import { configDirectory } from '@backend/env';
import rootLog from '@backend/root-log';
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

    // make sure cache key is a valid filename and sanitize it
    const cacheKeySanitized = cacheKey.replaceAll(/[^a-zA-Z0-9_-]/g, '_');

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

    const cacheFilePath = path.join(imageCacheDirectory, cacheKeySanitized);
    // check that cacheFilePath starts with imageCacheDirectory
    const normalizedCacheFilePath = path.normalize(cacheFilePath);
    if (!normalizedCacheFilePath.startsWith(imageCacheDirectory)) {
        log.error(
            `Cache file path ${cacheFilePath} is not within the cache directory ${imageCacheDirectory}.`,
        );
        return null;
    }

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
    } catch (error) {
        log.debug(`Cached image not found for ${url}, fetching...`, { error });
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

        // make sure the response is an image
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.startsWith('image/')) {
            log.warn(
                `Response from ${url} is not an image, resolving to original url`,
                { contentType },
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
    } catch (error) {
        log.error(
            `Error fetching or caching image from ${url}, resolving to original url`,
            { error },
        );
        return null;
    }
};
