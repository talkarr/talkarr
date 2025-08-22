import type { Locks } from '@prisma/client';

import pathUtils from 'node:path';
import typia from 'typia';

// eslint-disable-next-line import/no-cycle
import { startAddTalk } from '@backend/workers/add-talk';
import { startGenerateMissingNfo } from '@backend/workers/generate-missing-nfo';

import {
    addDownloadedFile,
    checkIfFileIsInDb,
    createNewTalkInfo,
    fixBigintInExtendedDbEvent,
    isEventDownloading,
    listEvents,
    setIsDownloading,
} from '@backend/events';
import {
    doesEventHaveNfoFile,
    doesTalkHaveExistingFilesOnDisk,
} from '@backend/fs';
import { handleConferenceMetadataGeneration } from '@backend/helper/nfo';
import { acquireLockAndReturn, releaseLock } from '@backend/locks';
import type { TaskFunction } from '@backend/queue';
import queue from '@backend/queue';
import rootLog from '@backend/root-log';
import type {
    ConvertBigintToNumberType,
    ExtendedDbEvent,
    NormalAndConvertedDate,
} from '@backend/types';

export const taskName = 'scanForMissingFiles';

const log = rootLog.child({ label: 'workers/scanForMissingFiles' });

export interface ScanForMissingFilesData {
    event?: ConvertBigintToNumberType<NormalAndConvertedDate<ExtendedDbEvent>>;
}

export const check = typia.createIs<ScanForMissingFilesData>();

const lock: Locks = {
    name: taskName,
};

const scanForMissingFiles: TaskFunction<ScanForMissingFilesData> = async (
    job,
    actualDone,
): Promise<void> => {
    log.info('Scanning for missing files...');

    if (!check(job.data)) {
        const jobDataValid = typia.validate<ScanForMissingFilesData>(job.data);

        log.error('Invalid data:', { jobDataValid });

        throw new Error('Invalid data');
    }

    if (!(await acquireLockAndReturn(lock))) {
        log.error('Could not acquire lock, early returning', {
            lock,
            jobId: job.id,
        });

        return actualDone(); // do not throw error
    }

    const done = async (error?: Error): Promise<void> => {
        await releaseLock(lock, false);
        actualDone(error);
    };

    const events = job.data.event
        ? [job.data.event]
        : // eslint-disable-next-line unicorn/no-await-expression-member
          (await listEvents()).map(e => fixBigintInExtendedDbEvent(e));

    let hasErrored = false;

    const handleEvent = async (
        event: (typeof events)[number],
    ): Promise<void> => {
        try {
            if (event.root_folder?.did_not_find_mark) {
                log.warn('Root folder mark was not found', {
                    title: event.title,
                    rootFolder: event.root_folder,
                });

                return;
            }

            const hasFiles = await doesTalkHaveExistingFilesOnDisk({ event });

            const hasNfo = await doesEventHaveNfoFile({ event });

            log.debug('Handling event', {
                title: event.title,
                slug: event.slug,
                hasFiles,
            });

            const result = await createNewTalkInfo({ talk: event });

            if (!result) {
                log.error('Error creating new talk info:', {
                    title: event.title,
                });
                return;
            }

            if (result.isNew) {
                log.info('Created new talk info:', { title: event.title });
            }

            if (hasFiles?.find(f => f.isVideo)) {
                await setIsDownloading({
                    eventGuid: event.guid,
                    isDownloading: false,
                });

                for await (const file of hasFiles) {
                    const fileIsInDb = await checkIfFileIsInDb({
                        eventGuid: event.guid,
                        path: file.path,
                    });

                    if (!fileIsInDb) {
                        log.info('Found file that is not in database yet', {
                            title: event.title,
                            file,
                            fileIsInDb,
                        });

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
                            eventInfoGuid: event.eventInfo?.guid,
                        });

                        if (!addFileToDbResult) {
                            log.error('Error adding file to db:', {
                                title: event.title,
                            });

                            throw new Error('Error adding file to db');
                        }
                    }
                }
            } else {
                // check if the event is downloading already
                const isDownloading = await isEventDownloading({
                    eventGuid: event.guid,
                });

                log.debug('Event downloading status', {
                    title: event.title,
                    isDownloading,
                    eventGuid: event.guid,
                    hasFiles,
                });

                if (isDownloading) {
                    log.info('Event is already downloading', {
                        title: event.title,
                    });
                } else {
                    log.info('Event is not downloading, starting add talk', {
                        title: event.title,
                        eventGuid: event.guid,
                    });

                    await startAddTalk({ event });
                }
            }

            if (!hasNfo) {
                await startGenerateMissingNfo({ event });
            }

            await handleConferenceMetadataGeneration({
                rootFolderPath: event.rootFolderPath,
                conference: event.conference,
            });
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
    };

    await Promise.all(events.map(element => handleEvent(element)));

    if (hasErrored) {
        log.error('Error scanning for missing files');
        return done(new Error('Error scanning for missing files'));
    }

    log.info('Finished scanning for missing files');

    return done();
};

queue.addWorker(taskName, { handler: scanForMissingFiles });

export const startScanForMissingFiles = async (
    data: ScanForMissingFilesData,
): Promise<void> => {
    await queue.enqueueJob(taskName, data);
};
