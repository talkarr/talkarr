import pathUtils from 'path';
import typia from 'typia';

// eslint-disable-next-line import/no-cycle
import { startAddTalk } from '@backend/workers/addTalk';
import { startGenerateMissingNfo } from '@backend/workers/generateMissingNfo';

import {
    addDownloadedFile,
    checkIfFileIsInDb,
    createNewTalkInfo,
    listEvents,
    setIsDownloading,
} from '@backend/events';
import { doesEventHaveNfoFile, doesTalkHaveExistingFiles } from '@backend/fs';
import type { TaskFunction } from '@backend/queue';
import queue from '@backend/queue';
import rootLog from '@backend/rootLog';
import type { ConvertDateToStringType, ExtendedDbEvent } from '@backend/types';

export const taskName = 'scanForMissingFiles';

const log = rootLog.child({ label: 'workers/scanForMissingFiles' });

export interface ScanForMissingFilesData {
    event?: ConvertDateToStringType<ExtendedDbEvent>;
}

export const check = typia.createIs<ScanForMissingFilesData>();

const scanForMissingFiles: TaskFunction<ScanForMissingFilesData> = async (
    job,
    done,
): Promise<void> => {
    log.info('Scanning for missing files...');

    if (!check(job.data)) {
        const jobDataValid = typia.validate<ScanForMissingFilesData>(job.data);

        log.error('Invalid data:', { jobDataValid });

        throw new Error('Invalid data');
    }

    const events = job.data.event ? [job.data.event] : await listEvents();

    let hasErrored = false;

    for await (const event of events) {
        try {
            if (event.root_folder.did_not_find_mark) {
                log.warn('Root folder mark was not found', {
                    title: event.title,
                    rootFolder: event.root_folder,
                });

                continue;
            }

            const hasFiles = await doesTalkHaveExistingFiles({ event });

            const hasNfo = await doesEventHaveNfoFile({ event });

            log.info(
                `${event.title} ${hasFiles ? 'has files' : 'is missing files'}`,
            );

            const result = await createNewTalkInfo({ talk: event });

            if (!result) {
                log.error('Error creating new talk info:', {
                    title: event.title,
                });
                continue;
            } else {
                log.info('Created new talk info:', { title: event.title });
            }

            if (!hasFiles) {
                startAddTalk({ event });
            } else {
                await setIsDownloading({
                    eventGuid: event.guid,
                    isDownloading: false,
                });

                for await (const file of hasFiles) {
                    const fileIsInDb = await checkIfFileIsInDb({
                        eventGuid: event.guid,
                        path: file.path,
                    });

                    log.info('Found file', {
                        title: event.title,
                        file,
                        fileIsInDb,
                    });

                    if (!fileIsInDb) {
                        const addFileToDbResult = await addDownloadedFile({
                            event,
                            file: {
                                path: file.path,
                                filename: pathUtils.basename(file.path),
                                url: event.frontend_link,
                                created: file.createdAt,
                                mime: file.mime,
                                bytes: file.size,
                                is_video: file.isVideo,
                            },
                        });

                        if (!addFileToDbResult) {
                            log.error('Error adding file to db:', {
                                title: event.title,
                            });

                            throw new Error('Error adding file to db');
                        }
                    }
                }
            }

            if (!hasNfo) {
                startGenerateMissingNfo({ event });
            }
        } catch (error) {
            log.error('Error scanning for missing files:', {
                error,
                title: event.title,
            });

            await setIsDownloading({
                eventGuid: event.guid,
                isDownloading: false,
            });

            hasErrored = true;
        }
    }

    if (hasErrored) {
        log.error('Error scanning for missing files');
        return done(new Error('Error scanning for missing files'));
    }

    return done();
};

queue.process(taskName, 1, scanForMissingFiles);

export const startScanForMissingFiles = (
    data: ScanForMissingFilesData,
): void => {
    queue.add(taskName, data, { removeOnComplete: true, timeout: 60000 * 3 }); // 3 minutes
};
