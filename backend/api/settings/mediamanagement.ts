import express from 'express';
import fs from 'node:fs';
import pathUtils from 'path';

import { startScanAndImportExistingFiles } from '@backend/workers/scanAndImportExistingFiles';

import { markRootFolder } from '@backend/fs';
import type { components } from '@backend/generated/schema';
import {
    addRootFolder,
    AddRootFolderResponse,
    deleteRootFolder,
    doesRootFolderExist,
    listRootFolders,
    setRootFolderMarked,
    setRootFolderMarkExists,
} from '@backend/rootFolder';
import rootLog from '@backend/rootLog';
import { getSettings } from '@backend/settings';
import type { ExpressRequest, ExpressResponse } from '@backend/types';

const log = rootLog.child({ label: 'settings/mediamanagement' });

const router = express.Router();

export const listFoldersFromFs = async (
    startFolderPathArg: string = '/',
): Promise<string[]> => {
    const startFolderPath = startFolderPathArg || '/';

    const folders = fs
        .readdirSync(startFolderPath, {
            withFileTypes: true,
            encoding: 'utf8',
        })
        .filter(file => {
            if (!file.isDirectory()) {
                return false;
            }

            if (file.name === '/proc' || file.name === '/sys') {
                return false;
            }

            if (startFolderPath === '/') {
                return true;
            }

            // check if folder can be read and written to
            try {
                fs.accessSync(
                    pathUtils.join(startFolderPath, file.name),
                    // eslint-disable-next-line no-bitwise
                    fs.constants.R_OK | fs.constants.W_OK,
                );
            } catch (error) {
                log.warn('Error accessing folder (READ_WRITE_CHECK):', {
                    error,
                    folder: pathUtils.join(startFolderPath, file.name),
                    startFolderPath,
                });

                return false;
            }

            return true;
        })
        .toSorted((a, b) => {
            // do it alphabetically. make sure dotfiles / hidden files are at the end
            if (a.name.startsWith('.')) {
                return 1;
            }

            if (b.name.startsWith('.')) {
                return -1;
            }

            return a.name.localeCompare(b.name);
        });

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
            const files = await listFoldersFromFs(folder);

            const separator = pathUtils.sep;

            res.json({ success: true, data: { files, separator } });
        } catch (error) {
            log.error('Error listing files', { error, folder });

            // check if error is because folder does not exist
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                res.status(404).json({
                    success: false,
                    error: `Folder does not exist (Error code ${(error as NodeJS.ErrnoException).code})`,
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
    '/info',
    async (
        _req: ExpressRequest<'/settings/mediamanagement/info', 'get'>,
        res: ExpressResponse<'/settings/mediamanagement/info', 'get'>,
    ) => {
        try {
            const config = getSettings().mediamanagement;

            const folders = await listRootFolders();

            const mappedFolders = folders.map(folder => {
                const stats = fs.statfsSync(folder.path);

                return {
                    folder: folder.path,
                    free_space: stats.bsize * stats.bfree,
                    marked: folder.marked,
                    did_not_find_mark: folder.did_not_find_mark,
                };
            });

            res.json({
                success: true,
                data: {
                    config: config as components['schemas']['MediaManagementConfig'],
                    folders: mappedFolders,
                },
            });
        } catch (error) {
            log.error('Error getting config:', { error });

            res.status(500).json({
                success: false,
                error: 'Internal Server Error',
            });
        }
    },
);

router.post(
    '/add',
    async (
        req: ExpressRequest<'/settings/mediamanagement/add', 'post'>,
        res: ExpressResponse<'/settings/mediamanagement/add', 'post'>,
    ) => {
        const { folder: rootFolderPath } = req.body;

        if (!rootFolderPath) {
            res.status(400).json({
                success: false,
                error: 'Folder is required',
            });

            return;
        }

        // Check if folder exists
        if (!fs.existsSync(rootFolderPath)) {
            log.error('Folder does not exist:', { rootFolderPath });

            res.status(404).json({
                success: false,
                error: 'Folder does not exist',
            });

            return;
        }

        // check if read permission is granted
        try {
            fs.accessSync(rootFolderPath, fs.constants.R_OK);
        } catch (error) {
            log.error('Error accessing folder (READ_CHECK):', {
                error,
                rootFolderPath,
            });

            res.status(403).json({
                success: false,
                error: 'Read permission denied',
            });

            return;
        }

        // check if write permission is granted
        try {
            fs.accessSync(rootFolderPath, fs.constants.W_OK);
        } catch (error) {
            log.error('Error accessing folder (WRITE_CHECK):', {
                error,
                rootFolderPath,
            });

            res.status(403).json({
                success: false,
                error: 'Write permission denied',
            });

            return;
        }

        try {
            const result = await addRootFolder({
                rootFolderPath,
            });

            if (result === AddRootFolderResponse.Duplicate) {
                res.status(409).json({
                    success: false,
                    error: 'Folder already exists',
                });

                return;
            }

            if (result === AddRootFolderResponse.Other) {
                res.status(500).json({
                    success: false,
                    error: 'Internal Server Error',
                });

                return;
            }

            log.info('Folder added:', { rootFolderPath });
        } catch (error) {
            log.error('Error adding folder:', {
                error,
                rootFolderPath,
            });

            res.status(500).json({
                success: false,
                error: 'Internal Server Error',
            });

            return;
        }

        if (await markRootFolder({ rootFolderPath })) {
            if (
                !(await setRootFolderMarked({
                    rootFolderPath,
                    marked: true,
                }))
            ) {
                log.error('Error setting root folder marked:', {
                    rootFolderPath,
                });

                res.status(500).json({
                    success: false,
                    error: 'Internal Server Error',
                });
            }

            log.info('Folder marked:', { rootFolderPath });
        } else {
            log.error('Error marking root folder:', { rootFolderPath });

            res.status(500).json({
                success: false,
                error: 'Internal Server Error',
            });
        }

        await startScanAndImportExistingFiles();

        res.json({ success: true, data: null });
    },
);

router.post(
    '/remove',
    async (
        req: ExpressRequest<'/settings/mediamanagement/remove', 'post'>,
        res: ExpressResponse<'/settings/mediamanagement/remove', 'post'>,
    ) => {
        const { folder: rootFolderPath } = req.body;

        if (!rootFolderPath) {
            res.status(400).json({
                success: false,
                error: 'Folder is required',
            });

            return;
        }

        try {
            const result = await deleteRootFolder({
                rootFolderPath,
            });

            if (!result) {
                res.status(500).json({
                    success: false,
                    error: 'Internal Server Error',
                });

                return;
            }
        } catch (error) {
            log.error('Error deleting folder:', { error });

            res.status(500).json({
                success: false,
                error: 'Internal Server Error',
            });

            return;
        }

        log.info('Folder removed:', { rootFolderPath });

        res.json({ success: true, data: null });
    },
);

router.post(
    '/root-folder-fix',
    async (
        req: ExpressRequest<
            '/settings/mediamanagement/root-folder-fix',
            'post'
        >,
        res: ExpressResponse<
            '/settings/mediamanagement/root-folder-fix',
            'post'
        >,
    ) => {
        const { path, fix_type: fixType } = req.body;

        if (!path || !fixType) {
            res.status(400).json({
                success: false,
                error: 'Path and fix type are required',
            });

            return;
        }

        const folderExists = await doesRootFolderExist({
            rootFolderPath: path,
        });

        if (!folderExists) {
            res.status(404).json({
                success: false,
                error: 'Root folder does not exist',
            });

            return;
        }

        switch (fixType) {
            case 'force_mark': {
                try {
                    const markResult = await markRootFolder({
                        rootFolderPath: path,
                    });

                    if (!markResult) {
                        log.error('Error forcing mark for root folder:', {
                            path,
                        });

                        res.status(500).json({
                            success: false,
                            error: 'Internal Server Error',
                        });

                        return;
                    }

                    const setMarkedResult = await setRootFolderMarked({
                        rootFolderPath: path,
                        marked: true,
                    });

                    if (!setMarkedResult) {
                        log.error('Error setting root folder marked:', {
                            path,
                        });

                        res.status(500).json({
                            success: false,
                            error: 'Internal Server Error',
                        });

                        return;
                    }

                    const setMarkExistsResult = await setRootFolderMarkExists({
                        rootFolderPath: path,
                    });

                    if (!setMarkExistsResult) {
                        log.error('Error setting root folder mark exists:', {
                            path,
                        });

                        res.status(500).json({
                            success: false,
                            error: 'Internal Server Error',
                        });

                        return;
                    }

                    res.json({
                        success: true,
                        data: null,
                    });

                    return;
                } catch (error) {
                    log.error('Error forcing mark for root folder:', {
                        error,
                        path,
                    });

                    res.status(500).json({
                        success: false,
                        error: 'Internal Server Error',
                    });

                    return;
                }
            }
            default: {
                log.error('Invalid fix type:', { fixType });

                res.status(400).json({
                    success: false,
                    error: 'Invalid fix type',
                });

                return;
            }
        }

        res.status(400).json({
            success: false,
            error: 'Invalid request',
        });
    },
);

export default router;
