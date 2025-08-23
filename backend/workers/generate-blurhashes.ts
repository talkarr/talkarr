import type { Event as DbEvent, Locks } from '@prisma/client';

import typia from 'typia';

// eslint-disable-next-line import/no-cycle
import {
    getConferencesWithMissingBlurhash,
    getEventsWithMissingBlurhash,
    setConferenceLogoBlurhash,
    setEventPosterBlurhash,
    setEventThumbBlurhash,
} from '@backend/events';
import { generateBlurhashDataUrlFromUrl } from '@backend/helper/blurhash';
import { acquireLockAndReturn, releaseLock } from '@backend/locks';
import type { DoneCallback, TaskFunction } from '@backend/queue';
import queue from '@backend/queue';
import rootLog from '@backend/root-log';
import type {
    ConvertBigintToNumberType,
    ExtendedDbEvent,
    NormalAndConvertedDate,
} from '@backend/types';

export const taskName = 'generateBlurhashes';

const log = rootLog.child({ label: 'workers/generateBlurhashes' });

const lock: Locks = {
    name: taskName,
};

export interface GenerateBlurhashesData {
    event?:
        | DbEvent
        | ConvertBigintToNumberType<NormalAndConvertedDate<ExtendedDbEvent>>;
    force?: boolean;
}

export const check = typia.createIs<GenerateBlurhashesData>();

const generateBlurhashes: TaskFunction<GenerateBlurhashesData> = async (
    job,
    actualDone,
) => {
    if (!check(job.data)) {
        log.error('Invalid data:', { data: job.data });

        throw new Error('Invalid data');
    }

    if (!(await acquireLockAndReturn(lock))) {
        log.error('Could not acquire lock, early returning', {
            lock,
            jobId: job.id,
        });

        return actualDone();
    }

    const done = async (...args: Parameters<DoneCallback>): Promise<void> => {
        await releaseLock(lock, false);

        return actualDone(...args);
    };

    // first, generate blurhashes for all conference logos
    const conferencesWithoutBlurhash =
        await getConferencesWithMissingBlurhash();

    log.info(
        `Found ${conferencesWithoutBlurhash.length} conferences without blurhash`,
    );

    for await (const conference of conferencesWithoutBlurhash) {
        log.info('Generating blurhash for conference', {
            acronym: conference.acronym,
        });

        try {
            const generatedBlurHashDataUrl =
                await generateBlurhashDataUrlFromUrl(conference.logo_url);

            if (!generatedBlurHashDataUrl) {
                log.error('Error generating blurhash for conference', {
                    acronym: conference.acronym,
                });
                continue;
            }

            if (
                !(await setConferenceLogoBlurhash({
                    acronym: conference.acronym,
                    blurHash: generatedBlurHashDataUrl,
                }))
            ) {
                log.error('Error saving blurhash for conference', {
                    acronym: conference.acronym,
                });
                continue;
            }
        } catch (error) {
            log.error('Unexpected error generating blurhash for conference', {
                acronym: conference.acronym,
                error,
            });
            continue;
        }

        log.info('Successfully generated blurhash for conference', {
            acronym: conference.acronym,
        });
    }

    // then, generate blurhashes for event posters and thumbnails
    const eventsWithoutBlurhash = await getEventsWithMissingBlurhash({
        overrideEvents: job.data.event ? [job.data.event] : undefined,
        force: job.data.force,
    });

    log.info(`Found ${eventsWithoutBlurhash.length} events without blurhash`, {
        override: !!job.data.event,
    });

    for await (const event of eventsWithoutBlurhash) {
        log.info('Generating blurhash for event', {
            guid: event.guid,
            title: event.title,
        });

        const handlePoster = async (): Promise<boolean> => {
            if (!event.poster_url) {
                return true;
            }

            const generatedBlurHashDataUrl =
                await generateBlurhashDataUrlFromUrl(event.poster_url);

            if (!generatedBlurHashDataUrl) {
                log.error('Error generating blurhash for event poster', {
                    guid: event.guid,
                    title: event.title,
                });
                return false;
            }

            if (
                !(await setEventPosterBlurhash({
                    guid: event.guid,
                    blurHash: generatedBlurHashDataUrl,
                }))
            ) {
                log.error('Error saving blurhash for event poster', {
                    guid: event.guid,
                    title: event.title,
                });
                return false;
            }

            return true;
        };

        const handleThumb = async (): Promise<boolean> => {
            if (!event.thumb_url) {
                return true;
            }

            const generatedBlurHashDataUrl =
                await generateBlurhashDataUrlFromUrl(event.thumb_url);

            if (!generatedBlurHashDataUrl) {
                log.error('Error generating blurhash for event thumbnail', {
                    guid: event.guid,
                    title: event.title,
                });
                return false;
            }

            if (
                !(await setEventThumbBlurhash({
                    guid: event.guid,
                    blurHash: generatedBlurHashDataUrl,
                }))
            ) {
                log.error('Error saving blurhash for event thumbnail', {
                    guid: event.guid,
                    title: event.title,
                });
                return false;
            }

            return true;
        };

        try {
            if (!(await handlePoster()) || !(await handleThumb())) {
                log.error('Error handling blurhash for event, skipping', {
                    guid: event.guid,
                    title: event.title,
                });
                continue;
            }
        } catch (error) {
            log.error(
                'Unexpected error handling blurhash for event, skipping',
                {
                    guid: event.guid,
                    title: event.title,
                    error,
                },
            );
            continue;
        }

        log.info('Successfully generated blurhash for event', {
            guid: event.guid,
            title: event.title,
        });
    }

    log.info('Finished generating blurhashes');

    return done();
};

export const startGenerateBlurhashes = async (
    data: GenerateBlurhashesData,
): Promise<void> => {
    await queue.enqueueJob(taskName, data);
};

queue.addWorker(taskName, { handler: generateBlurhashes, concurrency: 10 });
// run every 12 hours
queue.addRepeatingJob(taskName, {}, { mode: 'cron', cron: '0 */12 * * *' });
