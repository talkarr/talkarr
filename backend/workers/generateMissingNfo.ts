import typia from 'typia';

import { getFolderPathForTalk } from '@backend/fs';
import { handleNfoGeneration } from '@backend/helper/nfo';
import type { TaskFunction } from '@backend/queue';
import queue from '@backend/queue';
import rootLog from '@backend/rootLog';
import type { ConvertDateToStringType, ExtendedDbEvent } from '@backend/types';

export const taskName = 'generateMissingNfo';

const log = rootLog.child({ label: 'workers/generateMissingNfo' });

export interface GenerateMissingNfoData {
    talk: ConvertDateToStringType<ExtendedDbEvent>;
}

export const check = typia.createIs<GenerateMissingNfoData>();

const generateMissingNfo: TaskFunction<GenerateMissingNfoData> = async (
    job,
    done,
) => {
    const { talk } = job.data;

    if (!check(job.data)) {
        log.error('Invalid data:', { data: job.data });

        throw new Error('Invalid data');
    }

    try {
        const folder = await getFolderPathForTalk(talk);

        if (!folder) {
            log.error('Error getting folder path for talk:', {
                title: talk.title,
            });

            throw new Error('Error getting folder path for talk');
        }

        if (!(await handleNfoGeneration(folder, talk))) {
            log.error('Error generating missing nfo:', { title: talk.title });

            throw new Error('Error generating missing nfo');
        }

        done();
    } catch (error) {
        log.error('Error generating missing nfo:', { error });

        throw error;
    }
};

export const startGenerateMissingNfo = (data: GenerateMissingNfoData): void => {
    queue.add(taskName, data, { removeOnComplete: true }); // 1 minute
};

queue.process(taskName, generateMissingNfo);
