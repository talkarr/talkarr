import { getFolderPathForTalk } from '@backend/fs';
import { handleNfoGeneration } from '@backend/helper/nfo';
import type { TaskFunction } from '@backend/queue';
import queue from '@backend/queue';
import rootLog from '@backend/rootLog';
import type { ExtendedDbEvent } from '@backend/talks';

export const taskName = 'generateMissingNfo';

const log = rootLog.child({ label: 'workers/addTalk' });

export interface GenerateMissingNfoData {
    talk: ExtendedDbEvent;
}

const generateMissingNfo: TaskFunction<GenerateMissingNfoData> = async (
    job,
    done,
) => {
    const { talk } = job.data;

    try {
        const folder = await getFolderPathForTalk(talk);

        if (!folder) {
            log.error('Error getting folder path for talk:', talk.title);

            throw new Error('Error getting folder path for talk');
        }

        if (!(await handleNfoGeneration(folder, talk))) {
            log.error('Error generating missing nfo:', talk.title);

            throw new Error('Error generating missing nfo');
        }

        done();
    } catch (error) {
        log.error('Error generating missing nfo:', error);

        throw error;
    }
};

export const startGenerateMissingNfo = (data: GenerateMissingNfoData): void => {
    queue.add(taskName, data, { removeOnComplete: true }); // 1 minute
};

queue.process(taskName, generateMissingNfo);