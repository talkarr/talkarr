import type { Job as DatabaseJob } from '@prisma/client';

import type { components } from '@backend/generated/schema';
import { prisma } from '@backend/prisma';
import rootLog from '@backend/root-log';

import { JobStatus, Prisma } from '@prisma/client';

const log = rootLog.child({ label: 'queue' });

export interface DatabaseJobWithFunctions extends DatabaseJob {
    setProgress: (progress: number) => Promise<boolean>;
}

type QueueEventHandlers = {
    enqueued: (job: DatabaseJobWithFunctions) => void;
    error: (error: Error) => void;
    failed: (job: DatabaseJobWithFunctions, error: Error) => void;
    progress: (job: DatabaseJobWithFunctions, progress: number) => void;
    stalled: (job: DatabaseJobWithFunctions) => void;
    completed: (job: DatabaseJobWithFunctions) => void;
    processing: (job: DatabaseJobWithFunctions) => void;
};

type QueueEvents = keyof QueueEventHandlers;

type DoneCallback = (error?: Error | null) => void;

export type TaskFunction<T = any> = (
    job: DatabaseJobWithFunctions & { data: T },
    done: DoneCallback,
) => Promise<void>;

export interface JobHandler<T = any> {
    handler: TaskFunction<T>;
    concurrency?: number; // Default is 1
}

export class Queue {
    private jobQueue: DatabaseJobWithFunctions[] = [];
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

    public async enqueueJob(
        name: string,
        data: object | Prisma.JsonObject = {},
        options?: {
            addIfOverConcurrencyLimit?: boolean; // Default true. If false, the job will not be added if the concurrency limit is reached.
            keepAfterSuccess?: boolean; // Default false. If true, the job will not be removed from the queue after completion.
        },
    ): Promise<DatabaseJob | null> {
        if (!this.jobHandlers[name]) {
            throw new Error(`No handler for job ${name}`);
        }

        const handler = this.jobHandlers[name];
        const concurrency = handler.concurrency || 1;
        const activeJobs = this.jobQueue.filter(
            job =>
                job.name === name &&
                (job.status === JobStatus.Active ||
                    job.status === JobStatus.Waiting),
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

        try {
            const databaseEntry = await prisma.job.create({
                data: {
                    name,
                    data,
                    status: JobStatus.Waiting,
                    progress: 0,
                    startedAt: null,
                    keepAfterSuccess: options?.keepAfterSuccess || false,
                },
                select: {
                    id: true,
                    name: true,
                    data: true,
                    status: true,
                    progress: true,
                    startedAt: true,
                    keepAfterSuccess: true,
                },
            });

            const entryWithFunctions: DatabaseJobWithFunctions = {
                ...databaseEntry,
                setProgress: (progress: number) =>
                    this.updateJobProgress(databaseEntry.id, progress),
            };

            this.jobQueue.push(entryWithFunctions);
            this.emit('enqueued', entryWithFunctions);

            return entryWithFunctions;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                log.error(`Database error while enqueuing job ${name}:`, {
                    error: error.message,
                });
            } else {
                log.error(`Error while enqueuing job ${name}:`, {
                    error: (error as Error).message,
                });
            }
        }

        return null;
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

    private async handleQueue(): Promise<void> {
        await this.handleWaitingJobs();
    }

    private async handleWaitingJobs(): Promise<void> {
        const jobsToProcess = this.jobQueue.filter(
            job => job.status === JobStatus.Waiting,
        );

        if (jobsToProcess.length === 0) {
            return;
        }

        for await (const job of jobsToProcess) {
            // Check for concurrency limit
            const handler = this.jobHandlers[job.name];

            if (handler) {
                const concurrency = handler.concurrency || 1;
                const activeJobs = this.jobQueue.filter(
                    j => j.name === job.name && j.status === JobStatus.Active,
                ).length;

                if (activeJobs >= concurrency) {
                    log.debug(
                        `Job ${job.id} (${job.name}) is waiting due to concurrency limit`,
                    );
                    continue;
                }
            } else {
                log.error(`No handler found for job ${job.name}`);
                continue;
            }

            try {
                const jobIndex = this.jobQueue.findIndex(j => j.id === job.id);

                if (jobIndex === -1) {
                    log.error(`Job ${job.id} not found in queue`);
                    continue;
                }

                const updatedJob = await prisma.job.update({
                    where: { id: job.id },
                    data: {
                        status: JobStatus.Active,
                        startedAt: new Date(),
                    },
                    select: {
                        id: true,
                        name: true,
                        data: true,
                        status: true,
                        progress: true,
                        startedAt: true,
                        keepAfterSuccess: true,
                    },
                });
                this.jobQueue[jobIndex] = {
                    ...this.jobQueue[jobIndex],
                    ...updatedJob,
                };
                this.emit('processing', job);
            } catch (error) {
                if (error instanceof Prisma.PrismaClientKnownRequestError) {
                    log.error(
                        `Database error while updating job ${job.id} status to active:`,
                        {
                            error: error.message,
                        },
                    );
                } else {
                    log.error(
                        `Error while updating job ${job.id} status to active:`,
                        {
                            error: (error as Error).message,
                        },
                    );
                }
            }

            // Execute the job handler
            setTimeout(async () => {
                try {
                    await handler.handler(job, async (error?: Error | null) => {
                        const jobIndex = this.jobQueue.findIndex(
                            j => j.id === job.id,
                        );

                        if (jobIndex === -1) {
                            log.error(`Job ${job.id} not found in queue`);
                            return;
                        }

                        try {
                            if (error) {
                                const updatedJob = await prisma.job.update({
                                    where: { id: job.id },
                                    data: {
                                        status: JobStatus.Failed,
                                        progress: 0,
                                    },
                                    select: {
                                        id: true,
                                        name: true,
                                        data: true,
                                        status: true,
                                        progress: true,
                                        startedAt: true,
                                        keepAfterSuccess: true,
                                    },
                                });

                                this.jobQueue[jobIndex] = {
                                    ...this.jobQueue[jobIndex],
                                    ...updatedJob,
                                } as DatabaseJobWithFunctions;

                                this.emit('failed', job, error);
                                // remove job from queue
                                this.jobQueue = this.jobQueue.filter(
                                    j => j.id !== job.id,
                                );
                            } else {
                                const updatedJob = await prisma.job.update({
                                    where: { id: job.id },
                                    data: {
                                        status: JobStatus.Completed,
                                        progress: 100,
                                    },
                                    select: {
                                        id: true,
                                        name: true,
                                        data: true,
                                        status: true,
                                        progress: true,
                                        startedAt: true,
                                        keepAfterSuccess: true,
                                    },
                                });

                                this.jobQueue[jobIndex] = {
                                    ...this.jobQueue[jobIndex],
                                    ...updatedJob,
                                } as DatabaseJobWithFunctions;

                                this.emit('completed', job);

                                // remove job from queue
                                if (!job.keepAfterSuccess) {
                                    await prisma.job.delete({
                                        where: { id: job.id },
                                    });
                                    this.jobQueue = this.jobQueue.filter(
                                        j => j.id !== job.id,
                                    );
                                }
                            }
                        } catch (error_) {
                            if (
                                error_ instanceof
                                Prisma.PrismaClientKnownRequestError
                            ) {
                                log.error(
                                    `Database error while updating job ${job.id} status:`,
                                    {
                                        error: error_.message,
                                    },
                                );
                            } else {
                                log.error(
                                    `Error while updating job ${job.id} status:`,
                                    {
                                        error: (error_ as Error).message,
                                    },
                                );
                            }
                        }
                    });
                } catch (error) {
                    const jobIndex = this.jobQueue.findIndex(
                        j => j.id === job.id,
                    );

                    if (jobIndex === -1) {
                        log.error(`Job ${job.id} not found in queue`);
                        return;
                    }

                    const updatedJob = await prisma.job.update({
                        where: { id: job.id },
                        data: {
                            status: JobStatus.Failed,
                            progress: 0,
                        },
                        select: {
                            id: true,
                            name: true,
                            data: true,
                            status: true,
                            progress: true,
                            startedAt: true,
                            keepAfterSuccess: true,
                        },
                    });

                    this.jobQueue[jobIndex] = {
                        ...this.jobQueue[jobIndex],
                        ...updatedJob,
                    } as DatabaseJobWithFunctions;

                    this.emit('failed', job, error as Error);
                    // remove job from queue
                    this.jobQueue = this.jobQueue.filter(j => j.id !== job.id);

                    await prisma.job.delete({
                        where: { id: job.id },
                    });
                }
            }, 0);
        }
    }

    private async updateJobProgress(
        jobId: DatabaseJobWithFunctions['id'],
        progress: number,
    ): Promise<boolean> {
        if (progress < 0 || progress > 100) {
            log.error(`Invalid progress value: ${progress} for job ${jobId}`);
            return false;
        }

        const index = this.jobQueue.findIndex(j => j.id === jobId);

        if (index === -1) {
            log.error(`Job ${jobId} not found in queue for progress update`);
            return false;
        }

        const job = this.jobQueue[index];

        if (!job) {
            log.error(`Job ${jobId} not found for progress update`);
            return false;
        }

        if (job.status !== JobStatus.Active) {
            log.warn(
                `Job ${jobId} is not active, cannot update progress to ${progress}%`,
            );
            return false;
        }

        try {
            const updatedJob = await prisma.job.update({
                where: { id: jobId },
                data: { progress },
                select: {
                    id: true,
                    name: true,
                    data: true,
                    status: true,
                    progress: true,
                    startedAt: true,
                    keepAfterSuccess: true,
                },
            });

            // Update the job in the queue
            this.jobQueue[index] = {
                ...job,
                ...updatedJob,
            } as DatabaseJobWithFunctions;
            this.emit('progress', job, progress);

            return true;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                log.error(
                    `Database error while updating progress for job ${jobId}:`,
                    {
                        error: error.message,
                    },
                );
            } else {
                log.error(`Error while updating progress for job ${jobId}:`, {
                    error: (error as Error).message,
                });
            }
        }

        return false;
    }

    private async loadJobsFromDatabase(): Promise<void> {
        try {
            await prisma.job.updateMany({
                where: {
                    status: JobStatus.Active,
                },
                data: {
                    status: JobStatus.Waiting,
                },
            });

            const jobs = await prisma.job.findMany({
                where: {
                    status: {
                        in: [JobStatus.Active, JobStatus.Waiting],
                    },
                },
                select: {
                    id: true,
                    name: true,
                    data: true,
                    status: true,
                    progress: true,
                    startedAt: true,
                    keepAfterSuccess: true,
                },
            });

            this.jobQueue = jobs.map(job => ({
                ...job,
                setProgress: (progress: number) =>
                    this.updateJobProgress(job.id, progress),
            })) as DatabaseJobWithFunctions[];

            log.info(`Loaded ${this.jobQueue.length} jobs from database`);
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                log.error('Database error while loading jobs:', {
                    error: error.message,
                });
            } else {
                log.error('Error while loading jobs:', {
                    error: (error as Error).message,
                });
            }
        }
    }

    constructor(debug?: boolean) {
        this.loadJobsFromDatabase()
            .then(() => {
                // execute handleQueue in another thread
                setInterval(async () => {
                    await this.handleQueue();
                    // jobQueue without all the data attributes
                    if (debug) {
                        const jobQueueWithoutData = this.jobQueue.map(job => ({
                            ...job,
                            data: undefined, // Remove data to avoid cluttering the console
                        }));
                        console.dir(jobQueueWithoutData, {
                            depth: null,
                            colors: true,
                        });
                    }
                }, 500);
            })
            .catch(error => {
                log.error('Error loading jobs from database:', {
                    error: (error as Error).message,
                });
            });
    }

    public getJobs(): components['schemas']['TaskInfo'][] {
        return this.jobQueue.map(
            job =>
                ({
                    id: job.id,
                    name: job.name,
                    progress: job.progress,
                    status: job.status,
                    started_at: job.startedAt,
                }) as components['schemas']['TaskInfo'],
        );
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
