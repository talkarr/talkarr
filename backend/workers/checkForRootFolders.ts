import typia from 'typia';

import { startScanAndImportExistingFiles } from '@backend/workers/scanAndImportExistingFiles';
import { startScanForMissingFiles } from '@backend/workers/scanForMissingFiles';

import { isFolderMarked } from '@backend/fs';
import type { TaskFunction } from '@backend/queue';
import queue from '@backend/queue';
import { listRootFolders } from '@backend/rootFolder';
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

    const databaseRootFolders = await listRootFolders();

    for await (const rootFolder of databaseRootFolders) {
        const hasMark = await isFolderMarked(rootFolder);

        if (!hasMark) {
            log.error('Root folder not marked:', { rootFolder });

            throw new Error('Root folder not marked');
        } else {
            log.info('Root folder marked:', { rootFolder });
        }
    }

    if (data?.isInit) {
        startScanForMissingFiles({});

        startScanAndImportExistingFiles();
    }

    done();
};

export const startCheckForRootFolders = (
    data: CheckForRootFoldersData,
): void => {
    queue.add(taskName, data, { removeOnComplete: true });
};

queue.process(taskName, checkForRootFolders);
