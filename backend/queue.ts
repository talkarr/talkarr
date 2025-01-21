import type { DoneCallback, Job } from 'bull';

import Queue from 'bull';

import { redisConnection } from '@backend/redis';
import rootLog from '@backend/rootLog';

const log = rootLog.child({ label: 'queue' });

const queue = new Queue('talkarr', {
    redis: redisConnection,
});

queue.on('error', err => {
    log.error('Queue error:', { error: err });
});

queue.on('failed', (job, err) => {
    log.error(`Job ${job.id} (${job.name}) failed:`, {
        error: err,
        data: job.data,
    });
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

export default queue;
