import { doesTalkHaveExistingFiles } from '@backend/fs';
import type { TaskFunction } from '@backend/queue';
import queue from '@backend/queue';
import rootLog from '@backend/rootLog';
import type { ExtendedDbEvent } from '@backend/talks';
import { createNewTalkInfo, listTalks, setIsDownloading } from '@backend/talks';
import { startAddTalk } from '@backend/workers/addTalk';

export const taskName = 'scanForMissingFiles';

const log = rootLog.child({ label: 'workers/scanForMissingFiles' });

export interface ScanForMissingFilesData {
    event?: ExtendedDbEvent;
}

const scanForMissingFiles: TaskFunction<ScanForMissingFilesData> = async (
    job,
    done,
) => {
    log.info('Scanning for missing files...');

    const talks = job.data.event ? [job.data.event] : await listTalks();

    for await (const talk of talks) {
        const hasFiles = await doesTalkHaveExistingFiles(talk);

        log.info(
            `${talk.title} ${hasFiles ? 'has files' : 'is missing files'}`,
        );

        const result = await createNewTalkInfo(talk);

        if (!result) {
            log.error('Error creating new talk info:', talk.title);
            continue;
        }

        if (!hasFiles) {
            startAddTalk({ talk });
        } else {
            await setIsDownloading(talk.eventInfoGuid, false);
        }
    }

    done();
};

queue.process(taskName, 1, scanForMissingFiles);

export const startScanForMissingFiles = (
    data: ScanForMissingFilesData,
): void => {
    queue.add(taskName, data, { removeOnComplete: true, timeout: 60000 }); // 1 minute
};
