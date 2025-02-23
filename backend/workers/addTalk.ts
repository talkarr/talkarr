import type { DoneCallback } from 'bull';

import mime from 'mime-types';
import fs_promises from 'node:fs/promises';
import pathUtils from 'path';
import typia from 'typia';
import {
    create as createYoutubeDl,
    youtubeDl as normalYoutubeDl,
} from 'youtube-dl-exec';

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
    doesTalkHaveExistingFiles,
    getFolderPathForTalk,
    isVideoFile,
} from '@backend/fs';
import { handleConferenceMetadataGeneration } from '@backend/helper/nfo';
import type { TaskFunction } from '@backend/queue';
import queue from '@backend/queue';
import rootLog from '@backend/rootLog';
import type {
    ConvertBigintToNumberType,
    ConvertDateToStringType,
    ExtendedDbEvent,
} from '@backend/types';

const youtubeDl = process.env.YTDLP_PATH_OVERRIDE
    ? createYoutubeDl(process.env.YTDLP_PATH_OVERRIDE)
    : normalYoutubeDl;

export const taskName = 'addTalk';

const log = rootLog.child({ label: 'workers/addTalk' });

export interface AddTalkData {
    event: ConvertBigintToNumberType<ConvertDateToStringType<ExtendedDbEvent>>;
    force?: boolean;
}

export const check = typia.createIs<AddTalkData>();

let runningInstances = 0;

const maxRunningInstances = 1;
let instances: string[] = [];

const addTalk: TaskFunction<AddTalkData> = async (job, actualDone) => {
    const { event } = job.data;

    if (!check(job.data)) {
        log.error('Invalid data:', { data: job.data });

        throw new Error('Invalid data');
    }

    // wait for other instances to finish
    while (runningInstances >= maxRunningInstances) {
        const runningInstancesCopy = runningInstances;
        const instancesCopy = instances.slice();

        // eslint-disable-next-line no-await-in-loop
        await new Promise(resolve => {
            log.warn('Waiting for other instances to finish...', {
                runningInstancesCopy,
                maxRunningInstances,
                title: event.title,
                instancesCopy,
            });
            setTimeout(resolve, 5000);
        });
    }

    const done = async (...args: Parameters<DoneCallback>): Promise<void> => {
        runningInstances -= 1;

        instances = instances.filter(i => i !== event.title);

        actualDone(...args);
    };

    runningInstances += 1;
    instances.push(event.title);

    const isAlreadyDownloading = await isEventDownloading({
        eventGuid: event.guid,
        throwIfNotFound: true,
    });

    if (isAlreadyDownloading) {
        log.warn('Talk is already downloading:', { title: event.title });

        return done();
    }

    const wasAlreadyDownloaded = await doesTalkHaveExistingFiles({ event });

    if (
        wasAlreadyDownloaded?.filter(f => f.isVideo).length &&
        !job.data.force
    ) {
        log.warn('Talk was already downloaded:', { title: event.title });

        return done();
    }

    log.info('Adding talk...', { slug: job.data.event.slug });

    await clearDownloadError({ eventGuid: event.guid });

    if (!event.frontend_link) {
        log.error('Talk does not have a frontend link:', {
            title: event.title,
        });

        await setDownloadError({
            eventGuid: event.guid,
            error: 'Talk does not have a frontend link',
        });

        return done(new Error('Talk does not have a frontend link'));
    }

    try {
        const ytdlInstance = youtubeDl.exec(
            event.frontend_link,
            {
                dumpSingleJson: true,
                skipDownload: true,
                noWarnings: true,
            },
            {
                stdio: 'pipe',
            },
        );

        let stdoutBuffer = '';
        let stderrBuffer = '';
        let exitCode: number | null = null;

        ytdlInstance.stdout?.on('data', data => {
            try {
                const stdout = data.toString();

                stdoutBuffer += stdout;
            } catch (error) {
                log.error('Error handling ytdl stdout:', { error });
            }
        });

        ytdlInstance.stderr?.on('data', data => {
            try {
                const stderr = data.toString();

                stderrBuffer += stderr;
            } catch (error) {
                log.error('Error handling ytdl stderr:', { error });
            }
        });

        ytdlInstance.on('close', code => {
            log.warn('ytdl info-only close:', { code });
            exitCode = code;
        });

        ytdlInstance.on('error', error => {
            log.error('Error with ytdl:', { error });
        });

        exitCode = (await ytdlInstance).exitCode;

        if (exitCode !== 0) {
            log.error('Error fetching video info (exitCode != 0)', {
                exitCode,
                stderrBuffer,
                title: event.title,
                frontend_url: event.frontend_link,
            });

            await setDownloadError({
                eventGuid: event.guid,
                error: `Error fetching video info (${stderrBuffer || 'stderr empty'})`,
            });

            return await done(
                new Error('Error fetching video info (incorrect exit code)'),
            );
        }

        const videoInfo = JSON.parse(stdoutBuffer);

        if (!videoInfo) {
            log.error('No video info:', {
                title: event.title,
                frontend_url: event.frontend_link,
            });

            await setDownloadError({
                eventGuid: event.guid,
                error: 'No video info',
            });

            return await done(new Error('No video info'));
        }
    } catch (error) {
        log.error('Error fetching video info:', {
            error,
            eventInfoGuid: event.guid,
            title: event.title,
            frontend_url: event.frontend_link,
        });

        await setDownloadError({
            eventGuid: event.guid,
            error: 'Error fetching video info',
        });

        return done(new Error('Error fetching video info (catch)'));
    }

    const folder = await getFolderPathForTalk({ event });

    if (!folder) {
        log.error('Error getting folder path for talk:', {
            title: event.title,
        });

        await setDownloadError({
            eventGuid: event.guid,
            error: 'Error getting folder path for talk',
        });

        throw new Error('Error getting folder path for talk');
    }

    await setIsDownloading({ eventGuid: event.guid, isDownloading: true });

    let exitCode: number | null = null;

    let stderrBuffer = '';

    try {
        const outputPath = pathUtils.join(folder, `${event.slug}.%(ext)s`);

        log.info('Starting youtube-dl', { title: event.title, outputPath });
        // download video
        const videoSubprocess = youtubeDl.exec(
            event.frontend_link,
            {
                output: outputPath,
                noWarnings: true,
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

        exitCode = (await videoSubprocess).exitCode;

        if (!path) {
            return await done(new Error('No path found'));
        }

        const videoStats = await fs_promises.stat(path, {
            bigint: true,
        });

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
            eventInfoGuid: event.eventInfo?.guid,
        });

        if (!addFileToDbResult) {
            log.error('Error adding file to db:', { title: event.title });

            await setDownloadError({
                eventGuid: event.guid,
                error: 'Error adding file to db',
            });

            throw new Error('Error adding file to db');
        }

        await handleConferenceMetadataGeneration({
            rootFolderPath: folder,
            conference: event.conference,
        });

        startGenerateMissingNfo({ event });

        if (stderrBuffer) {
            log.error('Error downloading video:', { stderrBuffer });
            await setDownloadError({
                eventGuid: event.guid,
                error: stderrBuffer,
            });
        }

        await setDownloadExitCode({ eventGuid: event.guid, exitCode });

        await setIsDownloading({ eventGuid: event.guid, isDownloading: false });

        await clearDownloadError({ eventGuid: event.guid });

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
            eventGuid: event.guid,
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
