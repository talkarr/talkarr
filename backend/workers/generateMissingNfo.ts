import typia from 'typia';

import { getFolderPathForTalk } from '@backend/fs';
// eslint-disable-next-line import/no-cycle
import { handleNfoGeneration } from '@backend/helper/nfo';
import type { TaskFunction } from '@backend/queue';
import queue from '@backend/queue';
import rootLog from '@backend/rootLog';
import type {
    ConvertBigintToNumberType,
    ExtendedDbEvent,
    NormalAndConvertedDate,
} from '@backend/types';

export const taskName = 'generateMissingNfo';

const log = rootLog.child({ label: 'workers/generateMissingNfo' });

export interface GenerateMissingNfoData {
    event: ConvertBigintToNumberType<NormalAndConvertedDate<ExtendedDbEvent>>;
}

export const check = typia.createIs<GenerateMissingNfoData>();

const generateMissingNfo: TaskFunction<GenerateMissingNfoData> = async (
    job,
    done,
) => {
    const { event } = job.data;

    if (!check(job.data)) {
        log.error('Invalid data:', { data: job.data });

        throw new Error('Invalid data');
    }

    try {
        const folder = await getFolderPathForTalk({ event });

        if (!folder) {
            log.error('Error getting folder path for talk:', {
                title: event.title,
            });

            throw new Error('Error getting folder path for talk');
        }

        if (!(await handleNfoGeneration({ folder, event }))) {
            log.error('Error generating missing nfo:', {
                title: event.title,
                guid: event.guid,
            });

            throw new Error('Error generating missing nfo');
        }

        return done();
    } catch (error) {
        log.error('Error generating missing nfo:', {
            error,
            title: event.title,
            guid: event.guid,
        });

        throw error;
    }
};

export const startGenerateMissingNfo = (data: GenerateMissingNfoData): void => {
    queue.add(taskName, data, { removeOnComplete: true });
};

queue.process(taskName, generateMissingNfo);
