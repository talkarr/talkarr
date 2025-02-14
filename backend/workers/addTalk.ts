import mime from 'mime-types';
import fs_promises from 'node:fs/promises';
import pathUtils from 'path';
import typia from 'typia';
import youtubeDl from 'youtube-dl-exec';

// eslint-disable-next-line import/no-cycle
import { startGenerateMissingNfo } from '@backend/workers/generateMissingNfo';

import {
    addDownloadedFile,
    clearDownloadError,
    isEventDownloading,
    setDownloadError,
    setDownloadExitCode,
    setDownloadProgress,
    setIsDownloading,
} from '@backend/events';
import {
    defaultMimeType,
    getFolderPathForTalk,
    isVideoFile,
} from '@backend/fs';
import type { TaskFunction } from '@backend/queue';
import queue from '@backend/queue';
import rootLog from '@backend/rootLog';
import type { ConvertDateToStringType, ExtendedDbEvent } from '@backend/types';

export const taskName = 'addTalk';

const log = rootLog.child({ label: 'workers/addTalk' });

export interface AddTalkData {
    event: ConvertDateToStringType<ExtendedDbEvent>;
}

export const check = typia.createIs<AddTalkData>();

let runningInstances = 0;

const maxRunningInstances = 1;

const addTalk: TaskFunction<AddTalkData> = async (job, actualDone) => {
    const { event } = job.data;

    if (!check(job.data)) {
        log.error('Invalid data:', { data: job.data });

        throw new Error('Invalid data');
    }

    // wait for other instances to finish
    while (runningInstances >= maxRunningInstances) {
        const runningInstancesCopy = runningInstances;

        // eslint-disable-next-line no-await-in-loop
        await new Promise(resolve => {
            log.warn('Waiting for other instances to finish...', {
                runningInstancesCopy,
                maxRunningInstances,
                title: event.title,
            });
            setTimeout(resolve, 5000);
        });
    }

    const done = async (): Promise<void> => {
        runningInstances -= 1;

        actualDone();
    };

    runningInstances += 1;

    const isAlreadyDownloading = await isEventDownloading({
        eventInfoGuid: event.guid,
        throwIfNotFound: true,
    });

    if (isAlreadyDownloading) {
        log.warn('Talk is already downloading:', { title: event.title });

        return done();
    }

    log.info('Adding talk...', { slug: job.data.event.slug });

    await clearDownloadError({ eventGuid: event.guid });

    if (!event.frontend_link) {
        log.error('Talk does not have a frontend link:', {
            title: event.title,
        });

        await setDownloadError({
            eventInfoGuid: event.guid,
            error: 'Talk does not have a frontend link',
        });

        throw new Error('Talk does not have a frontend link');
    }

    try {
        const videoInfo = await youtubeDl(
            event.frontend_link,
            {
                dumpJson: true,
                format: 'best',
                skipDownload: true,
            },
            {
                stdio: 'pipe',
            },
        );

        if (!videoInfo || typeof videoInfo === 'string') {
            log.error('Error fetching video info:', { videoInfo });

            await setDownloadError({
                eventInfoGuid: event.guid,
                error: videoInfo ?? 'Unknown error',
            });

            throw new Error('Error fetching video info');
        }
    } catch (error) {
        log.error('Error fetching video info:', {
            error,
            title: event.title,
            frontend_url: event.frontend_link,
        });

        await setDownloadError({
            eventInfoGuid: event.guid,
            error: 'Error fetching video info',
        });

        throw new Error('Error fetching video info');
    }

    const folder = await getFolderPathForTalk({ event });

    if (!folder) {
        log.error('Error getting folder path for talk:', {
            title: event.title,
        });

        await setDownloadError({
            eventInfoGuid: event.guid,
            error: 'Error getting folder path for talk',
        });

        throw new Error('Error getting folder path for talk');
    }

    await setIsDownloading({ eventGuid: event.guid, isDownloading: true });

    let exitCode: number | null = null;

    let stderrBuffer = '';

    try {
        log.info('Starting youtube-dl', { title: event.title });
        // download video
        const videoSubprocess = youtubeDl.exec(
            event.frontend_link,
            {
                output: pathUtils.join(folder, `${event.slug}.%(ext)s`),
            },
            {
                stdio: 'pipe',
            },
        );

        videoSubprocess.on('spawn', () => {
            log.info('Video download started:', { title: event.title });
        });

        let lastProgress = 0;

        let path: string | null = null;

        // create buffer for stdout
        videoSubprocess.stdout?.on('data', async data => {
            const stdout = data.toString();

            const hasDestination = stdout.includes('Destination:');

            if (hasDestination) {
                const destination = stdout.match(/Destination: (.*)/);

                if (destination) {
                    // eslint-disable-next-line prefer-destructuring
                    path = destination[1];
                }
            }

            const progress = stdout.includes('[download]')
                ? stdout.match(/(\d+\.?\d*)%/)
                : null;

            const rounded = progress ? Math.round(parseFloat(progress[0])) : 0;

            if (rounded !== lastProgress) {
                lastProgress = rounded;
                await setDownloadProgress({
                    eventGuid: event.guid,
                    progress: rounded,
                });
            }
        });

        videoSubprocess.stderr?.on('data', data => {
            const stderr = data.toString();

            console.log('stderr:', stderr);

            stderrBuffer += stderr;
        });

        videoSubprocess.on('error', error => {
            console.log(event.title, 'error:', error);
        });

        videoSubprocess.on('close', code => {
            console.log(event.title, 'close:', code);
            exitCode = code;
        });

        await videoSubprocess;

        if (!path) {
            throw new Error('No path found');
        }

        const videoStats = await fs_promises.stat(path);

        const addFileToDbResult = await addDownloadedFile({
            event,
            file: {
                path,
                filename: pathUtils.basename(path),
                url: event.frontend_link,
                created: videoStats.birthtime,
                mime: mime.lookup(path) || defaultMimeType,
                bytes: videoStats.size,
                is_video: isVideoFile(path),
            },
        });

        if (!addFileToDbResult) {
            log.error('Error adding file to db:', { title: event.title });

            await setDownloadError({
                eventInfoGuid: event.guid,
                error: 'Error adding file to db',
            });

            throw new Error('Error adding file to db');
        }

        startGenerateMissingNfo({ event });

        if (stderrBuffer) {
            log.error('Error downloading video:', { stderrBuffer });
            await setDownloadError({
                eventInfoGuid: event.guid,
                error: stderrBuffer,
            });
        }

        await setDownloadExitCode({ eventInfoGuid: event.guid, exitCode });

        await setIsDownloading({ eventGuid: event.guid, isDownloading: false });

        return await done();
    } catch (error) {
        log.error('Error downloading video:', {
            error,
            stderrBuffer,
            exitCode,
        });

        const errorAsString =
            error instanceof Error
                ? error.message
                : typeof error === 'string'
                  ? error
                  : 'Unknown error';
        await setDownloadError({
            eventInfoGuid: event.guid,
            error: errorAsString,
        });

        await setIsDownloading({ eventGuid: event.guid, isDownloading: false });

        throw error;
    }
};

export const startAddTalk = (data: AddTalkData): void => {
    queue.add(taskName, data, {
        removeOnComplete: true,
        timeout: 1000 * 60 * 30, // 30 minutes
    });
};

queue.process(taskName, addTalk);
