import pathUtils from 'path';
import typia from 'typia';

// eslint-disable-next-line import/no-cycle
import { startAddTalk } from '@backend/workers/addTalk';
import { startGenerateMissingNfo } from '@backend/workers/generateMissingNfo';

import {
    addDownloadedFile,
    checkIfFileIsInDb,
    createNewTalkInfo,
    fixBigintInExtendedDbEvent,
    listEvents,
    setIsDownloading,
} from '@backend/events';
import {
    doesConferenceHaveNfoFile,
    doesEventHaveNfoFile,
    doesTalkHaveExistingFiles,
} from '@backend/fs';
import { handleConferenceNfoGeneration } from '@backend/helper/nfo';
import type { TaskFunction } from '@backend/queue';
import queue, { isTaskRunning, waitForTaskFinished } from '@backend/queue';
import rootLog from '@backend/rootLog';
import type {
    ConvertBigintToNumberType,
    ConvertDateToStringType,
    ExtendedDbEvent,
} from '@backend/types';

export const taskName = 'scanForMissingFiles';

const log = rootLog.child({ label: 'workers/scanForMissingFiles' });

export interface ScanForMissingFilesData {
    event?: ConvertBigintToNumberType<ConvertDateToStringType<ExtendedDbEvent>>;
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

    await waitForTaskFinished(taskName, null, job.id);

    const events = job.data.event
        ? [job.data.event]
        : (await listEvents()).map(e => fixBigintInExtendedDbEvent(e));

    let hasErrored = false;

    for await (const event of events) {
        try {
            if (event.root_folder?.did_not_find_mark) {
                log.warn('Root folder mark was not found', {
                    title: event.title,
                    rootFolder: event.root_folder,
                });

                continue;
            }

            const hasFiles = await doesTalkHaveExistingFiles({ event });

            const hasNfo = await doesEventHaveNfoFile({ event });

            const conferenceHasNfo = await doesConferenceHaveNfoFile({
                rootFolderPath: event.rootFolderPath,
                conference: event.conference,
            });

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

            if (!hasFiles?.find(f => f.isVideo)) {
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
            }

            if (!hasNfo) {
                startGenerateMissingNfo({ event });
            }

            if (!conferenceHasNfo) {
                await handleConferenceNfoGeneration({
                    rootFolderPath: event.rootFolderPath,
                    conference: event.conference,
                });
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

    log.info('Finished scanning for missing files');

    return done();
};

queue.process(taskName, scanForMissingFiles);

export const startScanForMissingFiles = async (
    data: ScanForMissingFilesData,
): Promise<void> => {
    if (await isTaskRunning(taskName)) {
        log.warn('Task is already running, skipping...');

        return;
    }

    queue.add(taskName, data, {
        removeOnComplete: true /* , timeout: 60000 * 3 */,
    }); // ~3 minutes~ no timeout
};

export const removeAllScanForMissingFilesTasks = async (): Promise<void> => {
    const jobs = await queue.getJobs(['active', 'waiting', 'delayed']);

    const scanForMissingFilesJobs = jobs.filter(job => job.name === taskName);

    await Promise.all(scanForMissingFilesJobs.map(job => job.remove()));
};
