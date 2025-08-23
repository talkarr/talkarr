import type { Locks } from '@prisma/client';

import mime from 'mime-types';
import fs_promises from 'node:fs/promises';
import pathUtils from 'node:path';
import typia from 'typia';
import {
    create as createYoutubeDl,
    youtubeDl as normalYoutubeDl,
} from 'youtube-dl-exec';

// eslint-disable-next-line import/no-cycle
import { startGenerateBlurhashes } from '@backend/workers/generate-blurhashes';
import { startGenerateMissingNfo } from '@backend/workers/generate-missing-nfo';

import {
    addDownloadedFile,
    clearDownloadError,
    isEventDownloading,
    listTalkFiles,
    setDownloadError,
    setDownloadExitCode,
    setDownloadProgress,
    setIsDownloading,
} from '@backend/events';
import {
    defaultMimeType,
    doesTalkHaveExistingFilesOnDisk,
    getEventFilename,
    getFolderPathForTalk,
    isVideoFile,
} from '@backend/fs';
import { handleConferenceMetadataGeneration } from '@backend/helper/nfo';
import { acquireLockAndReturn, releaseLock } from '@backend/locks';
import type { DoneCallback, TaskFunction } from '@backend/queue';
import queue from '@backend/queue';
import rootLog from '@backend/root-log';
import type {
    ConvertBigintToNumberType,
    ExtendedDbEvent,
    NormalAndConvertedDate,
} from '@backend/types';

const youtubeDl = process.env.YTDLP_PATH_OVERRIDE
    ? createYoutubeDl(process.env.YTDLP_PATH_OVERRIDE)
    : normalYoutubeDl;

export const taskName = 'addTalk';

const log = rootLog.child({ label: 'workers/addTalk' });

export interface AddTalkData {
    event: ConvertBigintToNumberType<NormalAndConvertedDate<ExtendedDbEvent>>;
    force?: boolean;
}

export const check = typia.createIs<AddTalkData>();

const lock: Locks = {
    name: taskName,
};

const addTalk: TaskFunction<AddTalkData> = async (job, actualDone) => {
    const { event } = job.data;

    if (!check(job.data)) {
        log.error('Invalid data:', job.data);

        throw new Error('Invalid data');
    }

    if (!(await acquireLockAndReturn(lock))) {
        log.error('Could not acquire lock, early returning', {
            lock,
            jobId: job.id,
            eventGuid: event.guid,
            title: event.title,
        });

        return actualDone(); // do not throw error
    }

    const done = async (...args: Parameters<DoneCallback>): Promise<void> => {
        await releaseLock(lock, false);

        return actualDone(...args);
    };

    let isAlreadyDownloading = false;
    try {
        isAlreadyDownloading = await isEventDownloading({
            eventGuid: event.guid,
            throwIfNotFound: true,
        });
    } catch (error) {
        log.error('Error checking if event is downloading:', {
            error,
            eventGuid: event.guid,
            title: event.title,
        });

        await setDownloadError({
            eventGuid: event.guid,
            error: 'Error checking if event is downloading',
        });

        return done(new Error('Error checking if event is downloading'));
    }

    if (isAlreadyDownloading) {
        log.warn('Talk is already downloading:', { title: event.title });

        return done();
    }

    const wasAlreadyDownloaded = await doesTalkHaveExistingFilesOnDisk({
        event,
    });

    if (
        wasAlreadyDownloaded?.filter(f => f.isVideo).length &&
        !job.data.force
    ) {
        log.warn('Talk was already downloaded:', { title: event.title });

        return done();
    }

    const hasKnownFiles = await listTalkFiles({
        eventGuid: event.guid,
    });

    if (
        hasKnownFiles?.filter(f => {
            if (!f.is_video) {
                return false;
            }

            // check if file exists on disk
            return fs_promises
                .access(f.path)
                .then(() => true)
                .catch(() => false);
        }).length &&
        !job.data.force
    ) {
        log.warn('Talk has known files:', { title: event.title });

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

        const awaitedProcess = await ytdlInstance;
        exitCode = awaitedProcess.exitCode;

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

        await releaseLock(lock, false);

        throw new Error('Error getting folder path for talk');
    }

    await setIsDownloading({ eventGuid: event.guid, isDownloading: true });

    let exitCode: number | null = null;

    let stderrBuffer = '';

    try {
        const outputPath = pathUtils.join(
            folder,
            getEventFilename({ event, extension: '%(ext)s' }),
        );

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

        let stdoutBuffer = '';

        // create buffer for stdout
        videoSubprocess.stdout?.on('data', async data => {
            const stdout = data.toString();

            stdoutBuffer += stdout;

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

            const rounded = progress
                ? Math.round(Number.parseFloat(progress[0]))
                : 0;

            if (rounded !== lastProgress) {
                lastProgress = rounded;
                await setDownloadProgress({
                    eventGuid: event.guid,
                    progress: rounded,
                });
                await job.setProgress(rounded);
            }
        });

        videoSubprocess.stderr?.on('data', data => {
            const stderr = data.toString();

            console.log('stderr:', stderr);

            stderrBuffer += stderr;
        });

        videoSubprocess.on('error', error => {
            log.error('Error with video download subprocess:', {
                error,
                title: event.title,
            });

            throw error;
        });

        videoSubprocess.on('close', code => {
            log.info('Video download finished:', {
                title: event.title,
                exitCode: code,
                stderrBuffer,
            });
            exitCode = code;
        });

        const awaitedVideoSubprocess = await videoSubprocess;
        exitCode = awaitedVideoSubprocess.exitCode;

        if (!path) {
            await setIsDownloading({
                eventGuid: event.guid,
                isDownloading: false,
            });

            await setDownloadError({
                eventGuid: event.guid,
                error: 'No path found',
            });

            log.debug('No path found:', {
                title: event.title,
                all_stdout: stdoutBuffer,
                stderrBuffer,
            });

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

            await releaseLock(lock, false);

            throw new Error('Error adding file to db');
        }

        await handleConferenceMetadataGeneration({
            rootFolderPath: event.root_folder.path,
            conference: event.conference,
        });

        await startGenerateMissingNfo({ event });

        await startGenerateBlurhashes({ event });

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

        await releaseLock(lock, false);

        throw error;
    }
};

export const startAddTalk = async (data: AddTalkData): Promise<void> => {
    await queue.enqueueJob(taskName, data);
};

queue.addWorker(taskName, { handler: addTalk });
