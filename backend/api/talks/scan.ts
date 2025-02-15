import { scanForExistingFiles } from '@backend/fs/scan';
import type { components } from '@backend/generated/schema';
import { listRootFolders } from '@backend/rootFolder';
import type { ExpressRequest, ExpressResponse } from '@backend/types';

const handleScanEventsRequest = async (
    req: ExpressRequest<'/talks/scan', 'post'>,
    res: ExpressResponse<'/talks/scan', 'post'>,
): Promise<void> => {
    const { root_folder: rootFolder } = req.body;

    const rootFolders = (await listRootFolders()).map(folder => folder.path);

    if (!rootFolders || !rootFolders.length) {
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
        typeof rootFolder !== 'string'
            ? rootFolders
            : rootFolders.includes(rootFolder)
              ? [rootFolder]
              : [];

    if (!foldersToScan.length) {
        res.status(400).json({
            success: false,
            error: 'Invalid root_folder',
        });

        return;
    }

    const mappedFiles: components['schemas']['ExtendedFileWithGuess'][] = [];

    for await (const rootFolderPath of foldersToScan) {
        const files = (await scanForExistingFiles({ rootFolderPath })) ?? [];

        if (!files.length) {
            continue;
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
    }

    res.json({
        success: true,
        data: { files: mappedFiles, has_new_files: mappedFiles.length > 0 },
    });
};

export default handleScanEventsRequest;
