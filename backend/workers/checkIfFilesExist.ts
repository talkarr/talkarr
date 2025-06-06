import typia from 'typia';

import { startScanAndImportExistingFiles } from '@backend/workers/scanAndImportExistingFiles';
import { startScanForMissingFiles } from '@backend/workers/scanForMissingFiles';

import { removeFileFromDatabase } from '@backend/events';
import { doesFileExist } from '@backend/fs';
import type { TaskFunction } from '@backend/queue';
import queue from '@backend/queue';
import { listFilesForRootFolder } from '@backend/rootFolder';
import rootLog from '@backend/rootLog';

export const taskName = 'checkIfFilesExist';

const log = rootLog.child({ label: 'workers/checkIfFilesExist' });

export interface CheckIfFilesExistData {
    rootFolder: string;
    isInit?: boolean;
    startScanForMissing?: boolean;
}

export const check = typia.createIs<CheckIfFilesExistData>();

const checkIfFilesExist: TaskFunction<CheckIfFilesExistData> = async (
    job,
    done,
) => {
    const { data } = job;

    if (!check(data)) {
        log.error('Invalid data:', { data });

        throw new Error('Invalid data');
    }

    const files = await listFilesForRootFolder({
        rootFolderPath: data.rootFolder,
    });

    if (files === null) {
        log.error('Error listing files for root folder:', {
            rootFolder: data.rootFolder,
        });

        throw new Error('Error listing files for root folder');
    }

    if (!files.length) {
        log.info('No files found for root folder, skipping check:', {
            rootFolder: data.rootFolder,
        });
    } else {
        log.info('Found files for root folder:', {
            rootFolder: data.rootFolder,
            files: files.length,
        });

        // check if files exist
        for await (const file of files) {
            log.debug('Checking file:', { filePath: file.path });

            // check if file exists
            const exists = await doesFileExist({ filePath: file.path });

            if (!exists) {
                log.warn(
                    'File does not exist anymore, deleting from database:',
                    {
                        filePath: file.path,
                    },
                );

                if (
                    !(await removeFileFromDatabase({
                        eventGuid: file.eventGuid,
                        path: file.path,
                    }))
                ) {
                    log.error('Error removing file from database:', {
                        filePath: file.path,
                    });
                }
            } else {
                log.debug('File exists:', { filePath: file.path });
            }
        }
    }

    if (data.startScanForMissing) {
        await startScanForMissingFiles({});

        startScanAndImportExistingFiles();
    }

    return done();
};

export const startCheckIfFilesExist = (data: CheckIfFilesExistData): void => {
    queue.add(taskName, data, { removeOnComplete: true });
};

queue.process(taskName, checkIfFilesExist);
