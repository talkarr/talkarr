import { importExistingFileFromFilesystem } from '@backend/events';
import { isFolderMarked } from '@backend/fs';
import { scanForExistingFiles } from '@backend/fs/scan';
import type { TaskFunction } from '@backend/queue';
import queue from '@backend/queue';
import { listRootFolders } from '@backend/rootFolder';
import rootLog from '@backend/rootLog';

export const taskName = 'scanAndImportExistingFiles';

const log = rootLog.child({ label: 'workers/scanAndImportExistingFiles' });

export const check = (): boolean => true;

const scanAndImportExistingFiles: TaskFunction = async (job, done) => {
    log.info('Scanning and importing existing files...');

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

        if (!scanResult || !scanResult.length) {
            log.info('No files found in root folder:', { rootFolder });

            continue;
        }

        log.info('Found files:', { files: scanResult.length });

        for await (const file of scanResult) {
            if (file.guess.confidence !== 100) {
                log.warn('File has too low confidence:', {
                    file: file.filename,
                    confidence: file.guess.confidence,
                });

                continue;
            }

            log.info('Importing file...', { file: file.filename });

            const result = await importExistingFileFromFilesystem({
                rootFolder: rootFolder.path,
                file,
            });

            if (!result) {
                log.error(
                    'Error importing file (importExistingFileFromFilesystem):',
                    { file: file.filename },
                );
            } else {
                log.info('File imported:', { file: file.filename });
            }
        }
    }

    return done();
};

export const startScanAndImportExistingFiles = (): void => {
    queue.add(taskName, {}, { removeOnComplete: true });
};

queue.process(taskName, 1, scanAndImportExistingFiles);
