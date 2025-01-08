import type { DoneCallback, Job } from 'bull';

import Queue from 'bull';

import { redisConnection } from '@backend/redis';

const queue = new Queue('talkarr', {
    redis: redisConnection,
});

queue.on('error', err => {
    console.error(`Queue error: ${err.message}`);
});

queue.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed: ${err.message}`);
});

queue.on('progress', (job, progress) => {
    console.log(`Job ${job.id} is ${progress}% done`);
});

export type TaskFunction<T extends object | undefined = undefined> = (
    job: Job<T>,
    done: DoneCallback,
) => Promise<void>;

export default queue;
