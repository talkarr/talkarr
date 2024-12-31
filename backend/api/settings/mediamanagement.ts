import express from 'express';
import fs from 'fs';
import path from 'path';

import rootLog from '@backend/rootLog';
import { getSettings, setSettings } from '@backend/settings';
import type { ExpressRequest, ExpressResponse } from '@backend/types';

const log = rootLog.child({ label: 'settings/mediamanagement' });

export interface MediamanagementSettings {
    folders: string[];
}

const router = express.Router();

export const listFolders = async (
    startFolderPath: string = '/',
): Promise<string[]> => {
    const folders = fs
        .readdirSync(startFolderPath || '/', {
            withFileTypes: true,
            encoding: 'utf8',
        })
        .filter(file => file.isDirectory());

    return folders.map(folder => folder.name);
};

router.get(
    '/files',
    async (
        req: ExpressRequest<'/settings/mediamanagement/files', 'get'>,
        res: ExpressResponse<'/settings/mediamanagement/files', 'get'>,
    ) => {
        const { folder } = req.query;

        try {
            const files = await listFolders(folder);

            const separator = path.sep;

            res.json({ success: true, data: { files, separator } });
        } catch (error) {
            log.error('Error listing files', error);

            // check if error is because folder does not exist
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                res.status(404).json({
                    success: false,
                    error: 'Folder does not exist',
                });

                return;
            }

            res.status(500).json({
                success: false,
                error: 'Internal Server Error',
            });
        }
    },
);

router.get(
    '/config',
    async (
        _req: ExpressRequest<'/settings/mediamanagement/config', 'get'>,
        res: ExpressResponse<'/settings/mediamanagement/config', 'get'>,
    ) => {
        const { folders, ...config } = getSettings().mediamanagement;

        const mappedFolders = folders.map(folder => {
            const stats = fs.statfsSync(folder);

            return {
                folder,
                free_space: stats.bsize * stats.bfree,
            };
        });

        res.json({
            success: true,
            data: {
                ...config,
                folders: mappedFolders,
            },
        });
    },
);

router.post(
    '/add',
    async (
        req: ExpressRequest<'/settings/mediamanagement/add', 'post'>,
        res: ExpressResponse<'/settings/mediamanagement/add', 'post'>,
    ) => {
        const { folder } = req.body;

        if (!folder) {
            res.status(400).json({
                success: false,
                error: 'Folder is required',
            });

            return;
        }

        // Check if folder exists
        if (!fs.existsSync(folder)) {
            log.error('Folder does not exist:', folder);

            res.status(404).json({
                success: false,
                error: 'Folder does not exist',
            });

            return;
        }

        // check if read permission is granted
        try {
            fs.accessSync(folder, fs.constants.R_OK);
        } catch (error) {
            log.error('Error accessing folder (READ_CHECK):', error);

            res.status(403).json({
                success: false,
                error: 'Read permission denied',
            });

            return;
        }

        // check if write permission is granted
        try {
            fs.accessSync(folder, fs.constants.W_OK);
        } catch (error) {
            log.error('Error accessing folder (WRITE_CHECK):', error);

            res.status(403).json({
                success: false,
                error: 'Write permission denied',
            });

            return;
        }

        await setSettings(
            'mediamanagement',
            current => {
                current.folders.push(folder);

                return current;
            },
            true,
        );

        res.json({ success: true, data: null });
    },
);

router.post(
    '/remove',
    async (
        req: ExpressRequest<'/settings/mediamanagement/remove', 'post'>,
        res: ExpressResponse<'/settings/mediamanagement/remove', 'post'>,
    ) => {
        const { folder } = req.body;

        if (!folder) {
            res.status(400).json({
                success: false,
                error: 'Folder is required',
            });

            return;
        }

        await setSettings(
            'mediamanagement',
            current => {
                const newFolders = current.folders.filter(
                    currentFolder => currentFolder !== folder,
                );

                return { ...current, folders: newFolders };
            },
            true,
        );

        res.json({ success: true, data: null });
    },
);

export default router;
