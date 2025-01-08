import fs_promises from 'fs/promises';
import mime from 'mime-types';
import pathUtils from 'path';

import rootLog from '@backend/rootLog';
import type { ExtendedDbEvent } from '@backend/types';

// filePath: `${USER_DEFINED_ROOT_FOLDER}/${CONFERENCE}/${FILENAME}`

// These file extensions are the ones provided by media.ccc.de.
export const validVideoFileExtensions = ['.mp4', '.webm'];

export const validFileExtensions = [...validVideoFileExtensions, '.nfo'];

export const nfoFilename = 'talk.nfo';

const log = rootLog.child({ label: 'fs' });

export interface ExistingFile {
    path: string;
    mime: string;
    size: number;
    isVideo: boolean;
    created_at: Date;
}

export const isVideoFile = (filename: string): boolean => {
    const ext = pathUtils.extname(filename).toLowerCase();

    return validVideoFileExtensions.includes(ext);
};
export const doesTalkHaveExistingFiles = async (
    event: ExtendedDbEvent,
): Promise<ExistingFile[] | null> => {
    if (!event.rootFolderPath) {
        log.debug('Event does not have a root folder path');
        return null;
    }

    try {
        await fs_promises.access(event.rootFolderPath);
    } catch {
        log.debug('Root folder path does not exist');
        return null;
    }

    if (!event.conference.acronym || !event.slug) {
        log.debug('Event does not have a conference acronym or slug');
        return null;
    }

    try {
        await fs_promises.access(
            pathUtils.join(event.rootFolderPath, event.conference.acronym),
        );
    } catch {
        log.debug('Conference folder does not exist');
        return null;
    }

    const filePath = pathUtils.join(
        event.rootFolderPath,
        event.conference.acronym,
        event.slug,
    );

    // check if folder exists
    try {
        await fs_promises.access(filePath);
    } catch {
        log.debug('Folder does not exist');
        return null;
    }

    // check if files exist
    const existingFiles: ExistingFile[] = [];

    for await (const extension of validFileExtensions) {
        try {
            const file = pathUtils.join(filePath, `${event.slug}${extension}`);

            await fs_promises.access(
                file,
                // eslint-disable-next-line no-bitwise
                fs_promises.constants.F_OK | fs_promises.constants.R_OK,
            );

            const stats = await fs_promises.stat(file);

            existingFiles.push({
                path: file,
                mime: mime.lookup(file) || 'application/octet-stream',
                size: stats.size,
                isVideo: isVideoFile(file),
                created_at: stats.birthtime,
            });
        } catch (error) {
            log.debug(`File ${event.slug}${extension} does not exist ${error}`);
        }
    }

    return existingFiles.length ? existingFiles : null;
};

export const doesEventHaveNfoFile = async (
    event: ExtendedDbEvent,
): Promise<boolean> => {
    if (!event.rootFolderPath) {
        return false;
    }

    try {
        await fs_promises.access(event.rootFolderPath);
    } catch {
        return false;
    }

    if (!event.conference.acronym || !event.slug) {
        return false;
    }

    try {
        await fs_promises.access(
            pathUtils.join(event.rootFolderPath, event.conference.acronym),
        );
    } catch {
        return false;
    }

    const filePath = pathUtils.join(
        event.rootFolderPath,
        event.conference.acronym,
        event.slug,
    );

    try {
        await fs_promises.access(
            pathUtils.join(filePath, nfoFilename),
            // eslint-disable-next-line no-bitwise
            fs_promises.constants.F_OK | fs_promises.constants.R_OK,
        );

        return true;
    } catch {
        return false;
    }
};

export const getFolderPathForTalk = async (
    event: Pick<ExtendedDbEvent, 'rootFolderPath' | 'slug' | 'conference'>,
): Promise<string | null> => {
    if (!event.rootFolderPath) {
        return null;
    }

    try {
        await fs_promises.access(event.rootFolderPath);
    } catch {
        return null;
    }

    if (!event.conference.acronym || !event.slug) {
        return null;
    }

    const folderPath = pathUtils.join(
        event.rootFolderPath,
        event.conference.acronym,
        event.slug,
    );

    await fs_promises.mkdir(folderPath, { recursive: true });

    try {
        await fs_promises.access(folderPath);
    } catch {
        return null;
    }

    return folderPath;
};
