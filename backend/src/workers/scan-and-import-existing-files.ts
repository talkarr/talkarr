import type { Locks } from '@prisma-generated/client';

import { importExistingFileFromFilesystem } from '@backend/events';
import { isFolderMarked } from '@backend/fs';
import { scanForExistingFiles } from '@backend/fs/scan';
import { acquireLockAndReturn } from '@backend/locks';
import type { TaskFunction } from '@backend/queue';
import queue from '@backend/queue';
import { listRootFolders } from '@backend/root-folder';
import rootLog from '@backend/root-log';

export const taskName = 'scanAndImportExistingFiles';

const log = rootLog.child({ label: 'workers/scanAndImportExistingFiles' });

export const check = (): boolean => true;

const lock: Locks = {
    name: taskName,
};

const scanAndImportExistingFiles: TaskFunction = async (job, done) => {
    log.info('Scanning and importing existing files...');

    if (!(await acquireLockAndReturn(lock))) {
        log.error('Could not acquire lock, early returning', {
            lock,
            jobId: job.id,
        });

        // do not throw error
        done();
        return;
    }

    const rootFolders = await listRootFolders();

    for await (const rootFolder of rootFolders) {
        log.info('Scanning root folder...', { rootFolder });

        const isMarked = await isFolderMarked({
            rootFolderPath: rootFolder.path,
        });

        if (!isMarked) {
            log.error('Root folder does not have mark:', { rootFolder });

            continue;
        }

        const scanResult = await scanForExistingFiles({
            rootFolderPath: rootFolder.path,
        });

        if (!scanResult || scanResult.length === 0) {
            log.info('No new files found in root folder:', { rootFolder });

            continue;
        }

        log.info('Found new files:', { files: scanResult.length });

        const handleImportFile = async (
            file: (typeof scanResult)[number],
        ): Promise<void> => {
            if (file.guess.confidence !== 100) {
                log.warn('File has too low confidence:', {
                    file: file.filename,
                    confidence: file.guess.confidence,
                });

                return;
            }

            log.info('Importing file...', { file: file.filename });

            const result = await importExistingFileFromFilesystem({
                rootFolder: rootFolder.path,
                file,
            });

            if (result) {
                log.info('File imported:', { file: file.filename });
            } else {
                log.error(
                    'Error importing file (importExistingFileFromFilesystem):',
                    { file: file.filename },
                );
            }
        };

        await Promise.all(
            scanResult.map(scanFile => handleImportFile(scanFile)),
        );
    }

    done();
};

queue.addWorker(taskName, {
    handler: scanAndImportExistingFiles,
});

export const startScanAndImportExistingFiles = async (): Promise<void> => {
    await queue.enqueueJob(taskName, {});
};
