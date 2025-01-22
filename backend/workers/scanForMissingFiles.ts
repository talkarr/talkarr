import pathUtils from 'path';
import typia from 'typia';

import { startAddTalk } from '@backend/workers/addTalk';
import { startGenerateMissingNfo } from '@backend/workers/generateMissingNfo';

import { doesEventHaveNfoFile, doesTalkHaveExistingFiles } from '@backend/fs';
import type { TaskFunction } from '@backend/queue';
import queue from '@backend/queue';
import rootLog from '@backend/rootLog';
import {
    addDownloadedFile,
    checkIfFileIsInDb,
    createNewTalkInfo,
    listTalks,
    setIsDownloading,
} from '@backend/talks';
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

    const talks = job.data.event ? [job.data.event] : await listTalks();

    for await (const talk of talks) {
        if (talk.root_folder.did_not_find_mark) {
            log.warn('Root folder mark was not found', {
                title: talk.title,
                rootFolder: talk.root_folder,
            });

            continue;
        }

        const hasFiles = await doesTalkHaveExistingFiles(talk);

        const hasNfo = await doesEventHaveNfoFile(talk);

        log.info(
            `${talk.title} ${hasFiles ? 'has files' : 'is missing files'}`,
        );

        const result = await createNewTalkInfo(talk);

        if (!result) {
            log.error('Error creating new talk info:', { title: talk.title });
            continue;
        }

        if (!hasFiles) {
            startAddTalk({ talk });
        } else {
            await setIsDownloading(talk.guid, false);

            for await (const file of hasFiles) {
                const fileIsInDb = await checkIfFileIsInDb(
                    talk.guid,
                    file.path,
                );

                log.info('Found file', {
                    title: talk.title,
                    file,
                    fileIsInDb,
                });

                if (!fileIsInDb) {
                    const addFileToDbResult = await addDownloadedFile(talk, {
                        path: file.path,
                        filename: pathUtils.basename(file.path),
                        url: talk.frontend_link,
                        created: file.createdAt,
                        mime: file.mime,
                        bytes: file.size,
                        is_video: file.isVideo,
                    });

                    if (!addFileToDbResult) {
                        log.error('Error adding file to db:', {
                            title: talk.title,
                        });

                        throw new Error('Error adding file to db');
                    }
                }
            }
        }

        if (!hasNfo) {
            startGenerateMissingNfo({ talk });
        }
    }

    done();
};

queue.process(taskName, 1, scanForMissingFiles);

export const startScanForMissingFiles = (
    data: ScanForMissingFilesData,
): void => {
    queue.add(taskName, data, { removeOnComplete: true, timeout: 60000 * 3 }); // 3 minutes
};
