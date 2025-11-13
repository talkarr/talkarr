import type { Locks } from '@prisma/client';

import { acquireLockAndReturn } from '@backend/locks';
import type { TaskFunction } from '@backend/queue';
import queue from '@backend/queue';
import rootLog from '@backend/root-log';
import { getUsers, updateUserPreferences } from '@backend/users';

export const taskName = 'validateUserPreferences';

const log = rootLog.child({ label: 'workers/validateUserPreferences' });

const lock: Locks = {
    name: taskName,
};

const validateUserPreferences: TaskFunction = async (job, done) => {
    if (!(await acquireLockAndReturn(lock))) {
        log.error('Could not acquire lock, early returning', {
            lock,
            jobId: job.id,
        });

        // do not throw error
        return done();
    }

    log.info('Validating user preferences...');

    const users = await getUsers();

    for await (const user of users) {
        try {
            await updateUserPreferences(user.id, user.preferences);
        } catch (error) {
            log.error(`Error validating user preferences`, {
                userId: user.id,
                message:
                    error instanceof Error ? error.message : 'unknown error',
            });
        }
    }

    log.info('Successfully validated user preferences');

    return done();
};

export const startValidateUserPreferences = async (): Promise<void> => {
    await queue.enqueueJob(taskName, {});
};

queue.addWorker(taskName, { handler: validateUserPreferences });
