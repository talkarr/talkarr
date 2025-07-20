import rootLog from '@backend/root-log';

import { taskName as addTalk } from './add-talk';
import {
    check as validateCheckForRootFolders,
    taskName as checkForRootFolders,
} from './check-for-root-folders';
import {
    check as validateGenerateMissingNfo,
    taskName as generateMissingNfo,
} from './generate-missing-nfo';
import {
    check as validateScanForMissingFiles,
    taskName as scanForMissingFiles,
} from './scan-for-missing-files';

const log = rootLog.child({ label: 'workers/index' });

export const taskNames = [
    addTalk,
    generateMissingNfo,
    scanForMissingFiles,
    checkForRootFolders,
] as const;

export type TaskNames =
    | 'generateMissingNfo'
    | 'scanForMissingFiles'
    | 'checkForRootFolders';

export type UsableTaskNames = Extract<(typeof taskNames)[number], TaskNames>;

type InternalUseableTaskNames = UsableTaskNames extends never
    ? '__NEVER__'
    : UsableTaskNames;

export type TaskValidator = {
    readonly [K in InternalUseableTaskNames]: (data: unknown) => boolean;
};

export const taskValidators: TaskValidator = {
    [generateMissingNfo]: validateGenerateMissingNfo,
    [scanForMissingFiles]: validateScanForMissingFiles,
    [checkForRootFolders]: validateCheckForRootFolders,
} as const;

export const isValidData = <T extends InternalUseableTaskNames>(
    taskName: T,
    data: unknown,
): data is Parameters<TaskValidator[T]>[0] => {
    if (!(taskName in taskValidators)) {
        log.warn('Invalid task name:', { taskName });
        return false;
    }

    const validator = taskValidators[taskName];

    return validator(data);
};
