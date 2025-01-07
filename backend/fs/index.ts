import fs_promises from 'fs/promises';
import pathUtils from 'path';

import type { components } from '@backend/generated/schema';
import rootLog from '@backend/rootLog';
import type { ExtendedDbEvent } from '@backend/talks';

// filePath: `${USER_DEFINED_ROOT_FOLDER}/${CONFERENCE}/${FILENAME}`

// These file extensions are the ones provided by media.ccc.de.
export const validFileExtensions = ['.mp4', '.webm'];

const log = rootLog.child({ label: 'fs' });

export const doesTalkHaveExistingFiles = async (
    event: ExtendedDbEvent,
): Promise<boolean> => {
    if (!event.rootFolderPath) {
        log.debug('Event does not have a root folder path');
        return false;
    }

    try {
        await fs_promises.access(event.rootFolderPath);
    } catch {
        log.debug('Root folder path does not exist');
        return false;
    }

    if (!event.conference.acronym || !event.slug) {
        log.debug('Event does not have a conference acronym or slug');
        return false;
    }

    try {
        await fs_promises.access(
            pathUtils.join(event.rootFolderPath, event.conference.acronym),
        );
    } catch {
        log.debug('Conference folder does not exist');
        return false;
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
        return false;
    }

    // check if files exist
    let fileExists = false;

    for await (const extension of validFileExtensions) {
        try {
            await fs_promises.access(
                pathUtils.join(filePath, `${event.slug}${extension}`),
            );

            fileExists = true;
        } catch (error) {
            log.debug(`File ${event.slug}${extension} does not exist ${error}`);
        }
    }

    return fileExists;
};

export const getFolderPathForTalk = async (
    event: ExtendedDbEvent,
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

export const getDownloadedFileInfo = async (
    path: string,
): Promise<
    Omit<
        components['schemas']['DownloadedFile'],
        'path' | 'root_folder' | 'filename'
    >
> => ({
    size: (await fs_promises
        .stat(path)
        .then(stats => stats.size)
        .catch(() => 0)) as number,
    mime_type: (await fs_promises
        .stat(path)
        .then(stats => stats.isFile() && stats.mtime.toISOString())
        .catch(() => null)) as string | null,
});
