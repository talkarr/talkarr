import rootLog from '@backend/rootLog';

import { check as validateAddTalk, taskName as addTalk } from './addTalk';
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
] as const;

export type InternalTaskNames = 'addTalk';

export type UsableTaskNames = Exclude<
    (typeof taskNames)[number],
    InternalTaskNames
>;

export type TaskValidator = {
    readonly [K in UsableTaskNames]: (data: unknown) => boolean;
};

export const taskValidators: TaskValidator = {
    [generateMissingNfo]: validateGenerateMissingNfo,
    [scanForMissingFiles]: validateScanForMissingFiles,
} as const;

export const isValidData = <T extends UsableTaskNames>(
    taskName: T,
    data: unknown,
): data is Parameters<TaskValidator[T]>[0] => {
    if (!(taskName in taskValidators)) {
        log.warn('Invalid task name:', taskName);
        return false;
    }

    const validator = taskValidators[taskName];

    return validator(data);
};
