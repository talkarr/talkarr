import typia from 'typia';

import { startCheckIfFilesExist } from '@backend/workers/checkIfFilesExist';
import { startScanAndImportExistingFiles } from '@backend/workers/scanAndImportExistingFiles';
import { startScanForMissingFiles } from '@backend/workers/scanForMissingFiles';

import { isFolderMarked } from '@backend/fs';
import type { TaskFunction } from '@backend/queue';
import queue from '@backend/queue';
import {
    clearAllRootFolderHasMarks,
    listRootFolders,
    setRootFolderMarkExists,
} from '@backend/rootFolder';
import rootLog from '@backend/rootLog';

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

    await clearAllRootFolderHasMarks();

    const databaseRootFolders = await listRootFolders();

    for await (const rootFolder of databaseRootFolders) {
        const index = databaseRootFolders.indexOf(rootFolder);

        if (index === -1) {
            log.error('Error indexing root folder:', { rootFolder });

            throw new Error('Error indexing root folder');
        }

        const isLast = index === databaseRootFolders.length - 1;

        const hasMark = await isFolderMarked(rootFolder.path);

        if (!hasMark) {
            log.error('Root folder not marked:', { rootFolder });

            throw new Error('Root folder not marked');
        } else {
            log.info('Root folder marked:', { rootFolder });

            await setRootFolderMarkExists(rootFolder.path);
            startCheckIfFilesExist({
                rootFolder: rootFolder.path,
                isInit: data?.isInit,
                startScanForMissing: isLast,
            });
        }
    }

    done();
};

export const startCheckForRootFolders = (
    data: CheckForRootFoldersData,
): void => {
    queue.add(taskName, data, { removeOnComplete: true });
};

queue.process(taskName, checkForRootFolders);
