import express from 'express';
import pathUtils from 'node:path';

import {
    getCachedImageFromUrl,
    imageCacheDirectory,
} from '@backend/image-cache';
import type { ExpressRequest, ExpressResponse } from '@backend/types';

const router = express.Router();

router.get(
    '/fetch',
    async (
        req: ExpressRequest<'/cache/fetch', 'get'>,
        res: ExpressResponse<'/cache/fetch', 'get'>,
    ) => {
        const { url, key } = req.query;

        if (!url || !key) {
            res.status(400).json({
                success: false,
                error: 'URL and key are required.',
            });
            return;
        }

        const cachedFile = await getCachedImageFromUrl({
            url,
            cacheKey: key,
        });

        if (!cachedFile) {
            res.status(404).json({
                success: false,
                error: 'Cached image not found.',
            });
            return;
        }

        const { cachePathOnFs, remainingCacheDuration } = cachedFile;

        const normalizedPath = pathUtils.normalize(cachePathOnFs);

        // Ensure the path is within the image cache directory
        if (!normalizedPath.startsWith(imageCacheDirectory)) {
            res.status(403).json({
                success: false,
                error: 'Invalid cache path.',
            });
            return;
        }

        // send file from the path 'cachedFile'
        res.status(200).sendFile(
            cachePathOnFs,
            {
                headers: {
                    'Cache-Control': `public, max-age=${Math.floor(
                        remainingCacheDuration / 1000,
                    )}`,
                },
            },
            err => {
                if (err) {
                    res.status(500).json({
                        success: false,
                        error: 'Error sending cached image.',
                    });
                }
            },
        );
    },
);

export default router;
