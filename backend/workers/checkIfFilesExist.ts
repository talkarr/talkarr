import typia from 'typia';

import { startScanAndImportExistingFiles } from '@backend/workers/scanAndImportExistingFiles';
import { startScanForMissingFiles } from '@backend/workers/scanForMissingFiles';

import { doesFileExist } from '@backend/fs';
import type { TaskFunction } from '@backend/queue';
import queue from '@backend/queue';
import { listFilesForRootFolder } from '@backend/rootFolder';
import rootLog from '@backend/rootLog';
import { removeFileFromDatabase } from '@backend/talks';

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

    const files = await listFilesForRootFolder(data.rootFolder);

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
            log.info('Checking file:', { filePath: file.path });

            // check if file exists
            const exists = await doesFileExist(file.path);

            if (!exists) {
                log.warn(
                    'File does not exist anymore, deleting from database:',
                    {
                        filePath: file.path,
                    },
                );

                if (
                    !(await removeFileFromDatabase(file.eventGuid, file.path))
                ) {
                    log.error('Error removing file from database:', {
                        filePath: file.path,
                    });
                }
            } else {
                log.info('File exists:', { filePath: file.path });
            }
        }
    }

    if (data.startScanForMissing) {
        startScanForMissingFiles({});

        startScanAndImportExistingFiles();
    }

    done();
};

export const startCheckIfFilesExist = (data: CheckIfFilesExistData): void => {
    queue.add(taskName, data, { removeOnComplete: true });
};

queue.process(taskName, checkIfFilesExist);
