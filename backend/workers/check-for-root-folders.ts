import typia from 'typia';

import { startCheckIfFilesExist } from '@backend/workers/check-if-files-exist';

import { isFolderMarked } from '@backend/fs';
import type { TaskFunction } from '@backend/queue';
import queue from '@backend/queue';
import {
    clearAllRootFolderHasMarks,
    listRootFolders,
    setRootFolderMarkExists,
} from '@backend/root-folder';
import rootLog from '@backend/root-log';

export const taskName = 'checkForRootFolders';

const log = rootLog.child({ label: 'workers/checkForRootFolders' });

export interface CheckForRootFoldersData {
    isInit?: boolean;
}

export const check = typia.createIs<CheckForRootFoldersData>();

const checkForRootFolders: TaskFunction<CheckForRootFoldersData> = async (
    job,
    done,
) => {
    const { data } = job;

    if (!check(data)) {
        log.error('Invalid data:', { data });

        throw new Error('Invalid data');
    }

    if (!(await clearAllRootFolderHasMarks())) {
        log.error('Error clearing root folder marks');

        throw new Error('Error clearing root folder marks');
    }

    const databaseRootFolders = await listRootFolders();

    if (databaseRootFolders.length === 0) {
        log.info('No root folders found');

        return done();
    }

    for await (const rootFolder of databaseRootFolders) {
        const index = databaseRootFolders.indexOf(rootFolder);

        if (index === -1) {
            log.error('Error indexing root folder:', { rootFolder });

            throw new Error('Error indexing root folder');
        }

        const isLast = index === databaseRootFolders.length - 1;

        const hasMark = await isFolderMarked({
            rootFolderPath: rootFolder.path,
        });

        if (hasMark) {
            log.info('Root folder marked:', { rootFolder });

            await setRootFolderMarkExists({ rootFolderPath: rootFolder.path });
            await startCheckIfFilesExist({
                rootFolder: rootFolder.path,
                isInit: data?.isInit,
                startScanForMissing: isLast,
            });
        } else {
            log.error('Root folder not marked:', { rootFolder });

            throw new Error('Root folder not marked');
        }
    }

    return done();
};

export const startCheckForRootFolders = async (
    data: CheckForRootFoldersData,
): Promise<void> => {
    await queue.enqueueJob(taskName, data);
};

queue.addWorker(taskName, { handler: checkForRootFolders });
