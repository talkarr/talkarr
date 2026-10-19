import { scanForExistingFiles } from '@backend/fs/scan';
import type { components } from '@backend/generated/schema';
import { verifyPermissions } from '@backend/middlewares';
import { Permission } from '@backend/permissions';
import { listRootFolders } from '@backend/root-folder';
import type { ExpressRequest, ExpressResponse } from '@backend/types';

const handleScanEventsRequest = async (
    req: ExpressRequest<'/talks/scan', 'post'>,
    res: ExpressResponse<'/talks/scan', 'post'>,
): Promise<void> => {
    if (!(await verifyPermissions(req, res, Permission.Admin))) {
        return;
    }

    const { root_folder: rootFolder } = req.body;

    // eslint-disable-next-line unicorn/no-await-expression-member
    const rootFolders = (await listRootFolders()).map(folder => folder.path);

    if (!rootFolders || rootFolders.length === 0) {
        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
        });

        return;
    }

    // root_folder can be string or undefined
    if (typeof rootFolder !== 'string' && typeof rootFolder !== 'undefined') {
        res.status(400).json({
            success: false,
            error: 'Invalid root_folder',
        });

        return;
    }

    const foldersToScan =
        typeof rootFolder === 'string'
            ? rootFolders.includes(rootFolder)
                ? [rootFolder]
                : []
            : rootFolders;

    if (foldersToScan.length === 0) {
        res.status(400).json({
            success: false,
            error: 'Invalid root_folder',
        });

        return;
    }

    const mappedFiles: components['schemas']['ExtendedFileWithGuess'][] = [];

    const scanFolder = async (folderPath: string): Promise<void> => {
        const files =
            (await scanForExistingFiles({ rootFolderPath: folderPath })) ?? [];

        if (files.length === 0) {
            return;
        }

        const mapped = files.map<
            components['schemas']['ExtendedFileWithGuess']
        >(
            ({
                isVideo,
                createdAt,
                guess: { conferenceAcronym, ...guess },
                ...file
            }) => ({
                ...file,
                size: Number(file.size),
                guess: {
                    ...guess,
                    conference_acronym: conferenceAcronym,
                    confidence: guess.confidence ?? 0,
                },
                is_video: isVideo,
                created_at: createdAt,
            }),
        );

        mappedFiles.push(...mapped);
    };

    await Promise.all(foldersToScan.map(folderPath => scanFolder(folderPath)));

    res.json({
        success: true,
        data: { files: mappedFiles, has_new_files: mappedFiles.length > 0 },
    });
};

export default handleScanEventsRequest;
