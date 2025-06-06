import type { DoneCallback, Job } from 'bull';

import Queue from 'bull';

import { releaseLock } from '@backend/locks';
import rootLog from '@backend/rootLog';

const log = rootLog.child({ label: 'queue' });

queue.on('error', err => {
    log.error('Queue error:', { error: err });
});

queue.on('failed', async (job, err) => {
    log.error(`Job ${job.id} (${job.name}) failed:`, {
        error: err,
        data: job.data,
    });

    // try to unlock the lock of the job
    await releaseLock(
        {
            name: job.name,
        },
        false,
    );
});

queue.on('progress', (job, progress) => {
    log.info(`Job ${job.id} (${job.name}) is ${progress}% done`);
});

queue.on('stalled', job => {
    log.error(`Job ${job.id} (${job.name}) stalled`);
});

queue.on('completed', job => {
    log.info(`Job ${job.id} (${job.name}) completed`);
});

export type TaskFunction<T extends object | undefined = undefined> = (
    job: Job<T>,
    done: DoneCallback,
) => Promise<void>;

export const isTaskRunning = async (
    taskName: string,
    ownId?: number | string,
): Promise<boolean> => {
    let jobs = await queue.getJobs(['active', 'waiting', 'delayed']);

    if (ownId) {
        jobs = jobs.filter(job => job.id !== ownId);
    }

    return jobs.some(job => job.name === taskName);
};

export const waitForTaskFinished = async (
    taskName: string,
    timeout: number | null = 30000,
    ownId?: number | string,
): Promise<void> => {
    const start = Date.now();

    // eslint-disable-next-line no-await-in-loop
    while (await isTaskRunning(taskName, ownId)) {
        if (timeout && Date.now() - start > timeout) {
            throw new Error('Timeout waiting for task to finish');
        }

        // eslint-disable-next-line no-await-in-loop
        await new Promise(resolve => {
            log.warn('Waiting for task to finish...', {
                taskName,
                timeout,
                ownId,
            });
            setTimeout(resolve, 5000);
        });
    }
};

export const removeAllJobs = async (): Promise<number> => {
    const jobsCount = await queue.getJobCounts();
    await queue.empty();

    log.info('Removed all jobs from the queue', {
        active: jobsCount.active,
        completed: jobsCount.completed,
        delayed: jobsCount.delayed,
        failed: jobsCount.failed,
        waiting: jobsCount.waiting,
    });

    return jobsCount.active + jobsCount.waiting + jobsCount.delayed;
};

export const printQueueStatus = async (): Promise<void> => {
    const jobsCount = await queue.getJobCounts();
    log.info('Queue status:', {
        active: jobsCount.active,
        completed: jobsCount.completed,
        delayed: jobsCount.delayed,
        failed: jobsCount.failed,
        waiting: jobsCount.waiting,
    });
};

export default queue;
