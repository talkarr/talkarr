import type { Locks } from '@prisma-generated/client';

import typia from 'typia';

// eslint-disable-next-line import/no-cycle
import {
    checkEventForProblems,
    fixBigintInExtendedDbEvent,
    listEvents,
    updateEventProblems,
} from '@backend/events';
import { acquireLockAndReturn, releaseLock } from '@backend/locks';
import type { TaskFunction } from '@backend/queue';
import queue from '@backend/queue';
import rootLog from '@backend/root-log';
import type {
    ConvertBigintToNumberType,
    ExtendedDbEvent,
    NormalAndConvertedDate,
} from '@backend/types';

export const taskName = 'checkEventsForProblems';

const log = rootLog.child({ label: 'workers/checkEventsForProblems' });

export interface CheckEventsForProblemsData {
    event?: ConvertBigintToNumberType<NormalAndConvertedDate<ExtendedDbEvent>>;
}

export const check = typia.createIs<CheckEventsForProblemsData>();

const lock: Locks = {
    name: taskName,
};

const checkEventsForProblems: TaskFunction<CheckEventsForProblemsData> = async (
    job,
    actualDone,
): Promise<void> => {
    if (!check(job.data)) {
        const jobDataValid = typia.validate<CheckEventsForProblemsData>(
            job.data,
        );

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

    log.info('Checking event(s) for problems...', { count: events.length });

    let hasErrored = false;

    const handleEvent = async (
        event: (typeof events)[number],
    ): Promise<void> => {
        try {
            const problems = await checkEventForProblems({
                rootFolderPath: event.root_folder.path,
                eventInfoGuid: event.eventInfo?.guid,
                cacheFilesystemCheck: true,
            });

            await updateEventProblems({
                guid: event.guid,
                problems: problems || [],
            });
        } catch (error) {
            log.error('Error checking event for problems:', {
                error,
                guid: event.guid,
            });
            hasErrored = true;
        }
    };

    await Promise.all(events.map(element => handleEvent(element)));

    if (hasErrored) {
        log.error('Error checking for problems');
        return done(new Error('Error checking for problems'));
    }

    log.info('Finished checking events for problems');

    return done();
};

queue.addWorker(taskName, { handler: checkEventsForProblems });

export const startCheckEventsForProblems = async (
    data: CheckEventsForProblemsData,
): Promise<void> => {
    await queue.enqueueJob(taskName, data);
};

// every 5 minutes
queue.addRepeatingJob(
    taskName,
    {},
    { mode: 'interval', interval: 5 * 60 * 1000 },
);
