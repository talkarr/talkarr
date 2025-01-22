import rootLog from '@backend/rootLog';

import { taskName as addTalk } from './addTalk';
import {
    check as validateCheckForRootFolders,
    taskName as checkForRootFolders,
} from './checkForRootFolders';
import {
    check as validateGenerateMissingNfo,
    taskName as generateMissingNfo,
} from './generateMissingNfo';
import {
    check as validateScanForMissingFiles,
    taskName as scanForMissingFiles,
} from './scanForMissingFiles';

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
