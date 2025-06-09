import rootLog from '@backend/rootLog';
import type { JSONCompatible } from '@backend/types';

const log = rootLog.child({ label: 'queue' });

type Job<T> = {
    id: string;
    name: string;
    data: JSONCompatible<T>;
    status: 'active' | 'waiting' | 'completed' | 'failed';
    setProgress: (number: number) => void;
    progress: number;
    startedAt: Date | null;
    keepAfterSuccess: boolean;
};

type UnknownJob = Exclude<Job<any>, 'data'> & {
    data: any;
};

type QueueEventHandlers = {
    enqueued: (job: UnknownJob) => void;
    error: (error: Error) => void;
    failed: (job: UnknownJob, error: Error) => void;
    progress: (job: UnknownJob, progress: number) => void;
    stalled: (job: UnknownJob) => void;
    completed: (job: UnknownJob) => void;
    processing: (job: UnknownJob) => void;
};

type QueueEvents = keyof QueueEventHandlers;

type DoneCallback = (error?: Error | null) => void;

export type TaskFunction<T = {}> = (
    job: Job<T>,
    done: DoneCallback,
) => Promise<void>;

export type UnknownTaskFunction = (
    job: UnknownJob,
    done: DoneCallback,
) => Promise<void>;

export interface JobHandler {
    handler: UnknownTaskFunction;
    concurrency?: number; // Default is 1
}

export class Queue {
    private jobQueue: UnknownJob[] = [];
    private listeners: Record<QueueEvents, QueueEventHandlers[QueueEvents][]> =
        {
            enqueued: [],
            error: [],
            failed: [],
            progress: [],
            stalled: [],
            completed: [],
            processing: [],
        };
    private jobIdCounter = 0;
    private jobHandlers: Record<string, JobHandler> = {};

    public on<QueueEvent extends QueueEvents>(
        event: QueueEvent,
        listener: QueueEventHandlers[QueueEvent],
    ): void {
        if (this.listeners[event]) {
            this.listeners[event].push(
                listener as QueueEventHandlers[QueueEvent],
            );
        } else {
            throw new Error(`Event ${event} is not supported`);
        }
    }

    public off(event: QueueEvents, listener: Function): void {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(
                l => l !== listener,
            );
        } else {
            throw new Error(`Event ${event} is not supported`);
        }
    }

    public enqueueJob<T = {}>(
        name: string,
        data: JSONCompatible<T>,
        options?: {
            addIfOverConcurrencyLimit?: boolean; // Default true. If false, the job will not be added if the concurrency limit is reached.
            keepAfterSuccess?: boolean; // Default false. If true, the job will not be removed from the queue after completion.
        },
    ): Job<T> | null {
        if (!this.jobHandlers[name]) {
            throw new Error(`No handler for job ${name}`);
        }

        const handler = this.jobHandlers[name];
        const concurrency = handler.concurrency || 1;
        const activeJobs = this.jobQueue.filter(
            job =>
                job.name === name &&
                (job.status === 'active' || job.status === 'waiting'),
        ).length;

        if (activeJobs >= concurrency) {
            if (options?.addIfOverConcurrencyLimit === false) {
                log.warn(
                    `Job ${name} not added due to concurrency limit reached. Active jobs: ${activeJobs}, Concurrency limit: ${concurrency}`,
                );
                return null;
            }
            log.warn(
                `Job ${name} is waiting due to concurrency limit. Active jobs: ${activeJobs}, Concurrency limit: ${concurrency}`,
            );
        }

        const jobId = this.jobIdCounter;
        this.jobIdCounter += 1;

        const job: Job<T> = {
            id: `${name}-${jobId}`,
            name,
            data,
            status: 'waiting',
            setProgress: (progress: number) => {
                if (progress < 0 || progress > 100) {
                    throw new Error('Progress must be between 0 and 100');
                }
                job.progress = progress;
                this.emit('progress', job as UnknownJob, progress);
            },
            progress: 0,
            startedAt: null,
            keepAfterSuccess: options?.keepAfterSuccess || false,
        };

        this.jobQueue.push(job as UnknownJob);
        this.emit('enqueued', job as UnknownJob);

        return job;
    }

    public addWorker(name: string, worker: JobHandler): void {
        if (this.jobHandlers[name]) {
            throw new Error(`Worker for job ${name} already exists`);
        }

        this.jobHandlers[name] = worker as JobHandler;
    }

    private emit<QueueEvent extends QueueEvents>(
        event: QueueEvent,
        ...args: Parameters<QueueEventHandlers[QueueEvent]>
    ): void {
        if (this.listeners[event]) {
            for (const listener of this.listeners[event]) {
                try {
                    // @ts-ignore
                    listener(...args);
                } catch (error) {
                    log.error(`Error in ${event} listener:`, { error });
                }
            }
        } else {
            throw new Error(`Event ${event} is not supported`);
        }
    }

    private handleQueue(): void {
        this.handleWaitingJobs();
    }

    private handleWaitingJobs(): void {
        const jobsToProcess = this.jobQueue.filter(
            job => job.status === 'waiting',
        );

        if (jobsToProcess.length === 0) {
            return;
        }

        for (const job of jobsToProcess) {
            // Check for concurrency limit
            const handler = this.jobHandlers[job.name];

            if (!handler) {
                log.error(`No handler found for job ${job.name}`);
                continue;
            } else {
                const concurrency = handler.concurrency || 1;
                const activeJobs = this.jobQueue.filter(
                    j => j.name === job.name && j.status === 'active',
                ).length;

                if (activeJobs >= concurrency) {
                    log.debug(
                        `Job ${job.id} (${job.name}) is waiting due to concurrency limit`,
                    );
                    continue;
                }
            }

            job.status = 'active';
            job.startedAt = new Date();
            this.emit('processing', job);

            // Execute the job handler
            setTimeout(async () => {
                try {
                    await handler.handler(job, (error?: Error | null) => {
                        if (error) {
                            job.status = 'failed';
                            this.emit('failed', job, error);
                            // remove job from queue
                            this.jobQueue = this.jobQueue.filter(
                                j => j.id !== job.id,
                            );
                        } else {
                            job.status = 'completed';
                            this.emit('completed', job);
                            // remove job from queue
                            if (!job.keepAfterSuccess) {
                                this.jobQueue = this.jobQueue.filter(
                                    j => j.id !== job.id,
                                );
                            }
                        }
                    });
                } catch (error) {
                    job.status = 'failed';
                    this.emit('failed', job, error as Error);
                    // remove job from queue
                    this.jobQueue = this.jobQueue.filter(j => j.id !== job.id);
                }
            }, 0);
        }
    }

    constructor() {
        // execute handleQueue in another thread
        setInterval(() => {
            this.handleQueue();
        }, 500);
    }
}

const queue = new Queue();

queue.on('enqueued', job => {
    log.info(`Job ${job.id} (${job.name}) enqueued`);
});

queue.on('error', err => {
    log.error('Queue error:', { error: err });
});

queue.on('failed', async (job, err) => {
    log.error(
        `Job ${job.id} (${job.name}) failed: \n${err.stack || err.message}`,
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

/* export const isTaskRunning = async (
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
}; */

export default queue;
