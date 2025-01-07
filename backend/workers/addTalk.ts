import fs from 'fs/promises';
import pathUtils from 'path';
import youtubeDl from 'youtube-dl-exec';

import { getFolderPathForTalk } from '@backend/fs';
import { generateNfo } from '@backend/helper/nfo';
import type { TaskFunction } from '@backend/queue';
import queue from '@backend/queue';
import rootLog from '@backend/rootLog';
import type { ExtendedDbEvent } from '@backend/talks';
import {
    addDownloadedFile,
    clearDownloadError,
    setDownloadError,
    setDownloadExitCode,
    setIsDownloading,
    updateDownloadProgress,
} from '@backend/talks';

export const taskName = 'addTalk';

const log = rootLog.child({ label: 'workers/addTalk' });

export interface AddTalkData {
    talk: ExtendedDbEvent;
}

const addTalk: TaskFunction<AddTalkData> = async (job, done) => {
    log.info('Adding talk...');

    const { talk } = job.data;

    await clearDownloadError(talk.eventInfoGuid);

    if (!talk.frontend_link) {
        log.error('Talk does not have a frontend link:', talk.title);

        await setDownloadError(
            talk.eventInfoGuid,
            'Talk does not have a frontend link',
        );

        throw new Error('Talk does not have a frontend link');
    }

    // check with yt-dlp if the video is still available
    const videoInfo = await youtubeDl(talk.frontend_link, {
        dumpJson: true,
        format: 'best',
    });

    if (typeof videoInfo === 'string') {
        log.error('Error fetching video info:', videoInfo);

        await setDownloadError(talk.eventInfoGuid, videoInfo);

        throw new Error('Error fetching video info');
    }

    const folder = await getFolderPathForTalk(talk);

    if (!folder) {
        log.error('Error getting folder path for talk:', talk.title);

        await setDownloadError(
            talk.eventInfoGuid,
            'Error getting folder path for talk',
        );

        throw new Error('Error getting folder path for talk');
    }

    await setIsDownloading(talk.eventInfoGuid, true);

    let exitCode: number | null = null;

    try {
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
                    eventInfoGuid: talk.eventInfoGuid,
                    progress: rounded,
                });
            }
        });

        let stderrBuffer = '';

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

        const addFileToDbResult = await addDownloadedFile(talk, {
            path,
            filename: pathUtils.basename(path),
            url: talk.frontend_link,
        });

        if (!addFileToDbResult) {
            log.error('Error adding file to db:', talk.title);

            await setDownloadError(
                talk.eventInfoGuid,
                'Error adding file to db',
            );

            throw new Error('Error adding file to db');
        }

        log.info('Generating NFO file...');

        const nfoContent = generateNfo(talk);

        // write nfo file
        await fs.writeFile(pathUtils.join(folder, 'talk.nfo'), nfoContent);

        log.info('NFO file generated.');

        await setDownloadError(talk.eventInfoGuid, stderrBuffer);

        await setDownloadExitCode(talk.eventInfoGuid, exitCode);

        done();
    } catch (error) {
        log.error('Error downloading video:', error);

        const errorAsString =
            error instanceof Error
                ? error.message
                : typeof error === 'string'
                  ? error
                  : 'Unknown error';
        await setDownloadError(talk.eventInfoGuid, errorAsString);

        throw error;
    } finally {
        await setIsDownloading(talk.eventInfoGuid, false);
    }
};

export const startAddTalk = (data: AddTalkData): void => {
    queue.add(taskName, data, { removeOnComplete: true, timeout: 60000 }); // 1 minute
};

queue.process(taskName, addTalk);
