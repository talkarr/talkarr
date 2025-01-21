import fs_promises from 'fs/promises';
import mime from 'mime-types';
import pathUtils from 'path';
import typia from 'typia';
import youtubeDl from 'youtube-dl-exec';

import { startGenerateMissingNfo } from '@backend/workers/generateMissingNfo';

import { getFolderPathForTalk, isVideoFile } from '@backend/fs';
import type { TaskFunction } from '@backend/queue';
import queue from '@backend/queue';
import rootLog from '@backend/rootLog';
import {
    addDownloadedFile,
    clearDownloadError,
    isEventDownloading,
    setDownloadError,
    setDownloadExitCode,
    setIsDownloading,
    updateDownloadProgress,
} from '@backend/talks';
import type { ConvertDateToStringType, ExtendedDbEvent } from '@backend/types';

export const taskName = 'addTalk';

const log = rootLog.child({ label: 'workers/addTalk' });

export interface AddTalkData {
    talk: ConvertDateToStringType<ExtendedDbEvent>;
}

export const check = typia.createIs<AddTalkData>();

const addTalk: TaskFunction<AddTalkData> = async (job, done) => {
    const { talk } = job.data;

    if (!check(job.data)) {
        log.error('Invalid data:', { data: job.data });

        throw new Error('Invalid data');
    }

    const isAlreadyDownloading = await isEventDownloading(talk.guid);

    if (isAlreadyDownloading) {
        log.warn('Talk is already downloading:', { title: talk.title });

        done();
    }

    log.info('Adding talk...', { slug: job.data.talk.slug });

    await clearDownloadError(talk.guid);

    if (!talk.frontend_link) {
        log.error('Talk does not have a frontend link:', { title: talk.title });

        await setDownloadError(talk.guid, 'Talk does not have a frontend link');

        throw new Error('Talk does not have a frontend link');
    }

    try {
        const videoInfo = await youtubeDl(
            talk.frontend_link,
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

            await setDownloadError(talk.guid, videoInfo ?? 'Unknown error');

            throw new Error('Error fetching video info');
        }
    } catch (error) {
        log.error('Error fetching video info:', {
            error,
            title: talk.title,
            frontend_url: talk.frontend_link,
        });

        await setDownloadError(talk.guid, 'Error fetching video info');

        throw new Error('Error fetching video info');
    }

    const folder = await getFolderPathForTalk(talk);

    if (!folder) {
        log.error('Error getting folder path for talk:', { title: talk.title });

        await setDownloadError(talk.guid, 'Error getting folder path for talk');

        throw new Error('Error getting folder path for talk');
    }

    await setIsDownloading(talk.guid, true);

    let exitCode: number | null = null;

    let stderrBuffer = '';

    try {
        log.info('Starting youtube-dl', { title: talk.title });
        // download video
        const videoSubprocess = youtubeDl.exec(
            talk.frontend_link,
            {
                output: pathUtils.join(folder, `${talk.slug}.%(ext)s`),
            },
            {
                stdio: 'pipe',
            },
        );

        videoSubprocess.on('spawn', () => {
            log.info('Video download started:', { title: talk.title });
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
                await updateDownloadProgress({
                    eventGuid: talk.guid,
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
            console.log(talk.title, 'error:', error);
        });

        videoSubprocess.on('close', code => {
            console.log(talk.title, 'close:', code);
            exitCode = code;
        });

        await videoSubprocess;

        if (!path) {
            throw new Error('No path found');
        }

        const videoStats = await fs_promises.stat(path);

        const addFileToDbResult = await addDownloadedFile(talk, {
            path,
            filename: pathUtils.basename(path),
            url: talk.frontend_link,
            created: videoStats.birthtime,
            mime: mime.lookup(path) || 'application/octet-stream',
            bytes: videoStats.size,
            is_video: isVideoFile(path),
        });

        if (!addFileToDbResult) {
            log.error('Error adding file to db:', { title: talk.title });

            await setDownloadError(talk.guid, 'Error adding file to db');

            throw new Error('Error adding file to db');
        }

        startGenerateMissingNfo({ talk });

        if (stderrBuffer) {
            log.error('Error downloading video:', { stderrBuffer });
        }

        await setDownloadError(talk.guid, stderrBuffer);

        await setDownloadExitCode(talk.guid, exitCode);

        await setIsDownloading(talk.guid, false);

        done();
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
        await setDownloadError(talk.guid, errorAsString);

        await setIsDownloading(talk.guid, false);

        throw error;
    }
};

export const startAddTalk = (data: AddTalkData): void => {
    queue.add(taskName, data, { removeOnComplete: true, timeout: 60000 }); // 1 minute
};

queue.process(taskName, addTalk);
