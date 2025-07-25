import mime from 'mime-types';
import fs_promises from 'node:fs/promises';
import pathUtils from 'node:path';

import { prisma } from '@backend/prisma';
import rootLog from '@backend/root-log';
import type {
    ConvertBigintToNumberType,
    ExtendedDbEvent,
    NormalAndConvertedDate,
} from '@backend/types';

// These file extensions are the ones provided by media.ccc.de.
export const validVideoFileExtensions = ['.mp4', '.webm'];

export const validFileExtensions = [...validVideoFileExtensions, '.nfo'];

export const conferenceNfoFilename = 'tvshow.nfo';

export const conferenceThumbFilename = 'poster.jpg';

export const rootFolderMarkName = '.talkarr';

export const rootFolderMarkContent =
    '!!! This is a Talkarr root folder. Please do not delete this file !!!';

export const defaultMimeType = 'application/octet-stream';

export const videoFolder = 'Events';

const log = rootLog.child({ label: 'fs' });

export interface ExistingFile {
    path: string;
    mime: string;
    size: bigint;
    size_str: string;
    isVideo: boolean;
    createdAt: Date;
}

export const isVideoFile = (filename: string): boolean => {
    const ext = pathUtils.extname(filename).toLowerCase();

    return validVideoFileExtensions.includes(ext);
};
export const doesTalkHaveExistingFilesOnDisk = async ({
    event,
}: {
    event: ConvertBigintToNumberType<NormalAndConvertedDate<ExtendedDbEvent>>;
}): Promise<ExistingFile[] | null> => {
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
            pathUtils.join(
                event.rootFolderPath,
                event.conference.acronym,
                videoFolder,
            ),
        );
    } catch {
        log.debug('Conference folder does not exist');
        return null;
    }

    const filePath = pathUtils.join(
        event.rootFolderPath,
        event.conference.acronym,
        videoFolder,
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

            const stats = await fs_promises.stat(file, {
                bigint: true,
            });

            existingFiles.push({
                path: file,
                mime: mime.lookup(file) || defaultMimeType,
                size: stats.size,
                size_str: stats.size.toString(),
                isVideo: isVideoFile(file),
                createdAt: stats.birthtime,
            });
        } catch (error) {
            log.debug(`File ${event.slug}${extension} does not exist ${error}`);
        }
    }

    log.debug(`Found ${existingFiles.length} existing files`, {
        existingFiles,
    });

    return existingFiles.length > 0 ? existingFiles : null;
};

export const getEventFilename = ({
    event,
    extension,
}: {
    event: ConvertBigintToNumberType<NormalAndConvertedDate<ExtendedDbEvent>>;
    extension: string;
}): string => {
    const ext = extension.replace(/^\./, '');

    // remove all numbers etc. from the slug. only allow letters, dashes and underscores. replace all spaces with dashes
    const slugWithoutConference = event.slug.replace(
        `${event.conference.acronym}-`,
        '',
    );

    const slug = slugWithoutConference
        .replaceAll(' ', '-')
        .replaceAll(/[^a-zA-Z-_]/g, '')
        .toLowerCase()
        .trim()
        .replace(/^-+/, '')
        .replace(/-+$/, '');

    return `${slug}.${ext}`;
};

export const doesEventHaveNfoFile = async ({
    event,
}: {
    event: ConvertBigintToNumberType<NormalAndConvertedDate<ExtendedDbEvent>>;
}): Promise<boolean> => {
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
            pathUtils.join(
                event.rootFolderPath,
                event.conference.acronym,
                videoFolder,
            ),
        );
    } catch {
        return false;
    }

    const filePath = pathUtils.join(
        event.rootFolderPath,
        event.conference.acronym,
        videoFolder,
        event.slug,
    );

    try {
        await fs_promises.access(
            pathUtils.join(
                filePath,
                getEventFilename({
                    event,
                    extension: 'nfo',
                }),
            ),
            // eslint-disable-next-line no-bitwise
            fs_promises.constants.F_OK | fs_promises.constants.R_OK,
        );

        return true;
    } catch {
        return false;
    }
};

export const doesFileExist = async ({
    filePath,
}: {
    filePath: string;
}): Promise<boolean> => {
    try {
        await fs_promises.access(
            filePath,
            // eslint-disable-next-line no-bitwise
            fs_promises.constants.F_OK | fs_promises.constants.R_OK,
        );

        return true;
    } catch {
        return false;
    }
};

// place a .talkarr file into the root folder to mark it as a root folder
export const markRootFolder = async ({
    rootFolderPath,
}: {
    rootFolderPath: string;
}): Promise<boolean> => {
    const filePath = pathUtils.join(rootFolderPath, rootFolderMarkName);

    try {
        await fs_promises.writeFile(filePath, rootFolderMarkContent);

        return true;
    } catch (error) {
        log.error(`Could not create file ${filePath}`, error);

        return false;
    }
};

export const isFolderMarked = async ({
    rootFolderPath,
}: {
    rootFolderPath: string;
}): Promise<boolean> => {
    const filePath = pathUtils.join(rootFolderPath, rootFolderMarkName);

    try {
        await fs_promises.access(filePath);

        return true;
    } catch {
        return false;
    }
};

type GetFolderPathForTalkEvent = Pick<
    ExtendedDbEvent,
    'rootFolderPath' | 'slug' | 'conference'
>;

export const getFolderPathForTalk = async ({
    event,
    skipFilesystemAccess,
}: {
    event: ConvertBigintToNumberType<
        NormalAndConvertedDate<GetFolderPathForTalkEvent>
    >;
    skipFilesystemAccess?: boolean;
}): Promise<string | null> => {
    if (!event.rootFolderPath) {
        return null;
    }

    if (
        !skipFilesystemAccess &&
        !(await isFolderMarked({ rootFolderPath: event.rootFolderPath }))
    ) {
        log.warn(
            'Cannot get folder path for talk, root folder does not have mark',
            {
                title: event.slug,
                root_folder_path: event.rootFolderPath,
            },
        );
        return null;
    }

    try {
        if (!skipFilesystemAccess) {
            await fs_promises.access(event.rootFolderPath);
        }
    } catch {
        return null;
    }

    if (!event.conference.acronym || !event.slug) {
        return null;
    }

    const folderPath = pathUtils.join(
        event.rootFolderPath,
        event.conference.acronym,
        videoFolder,
        event.slug,
    );

    if (!skipFilesystemAccess) {
        await fs_promises.mkdir(folderPath, { recursive: true });

        try {
            await fs_promises.access(folderPath);
        } catch {
            log.error(`Could not create folder ${folderPath}`);
            return null;
        }
    }

    return folderPath;
};

export const deleteFilesForEvent = async ({
    event,
}: {
    event: ConvertBigintToNumberType<NormalAndConvertedDate<ExtendedDbEvent>>;
}): Promise<boolean> => {
    if (!event.rootFolderPath) {
        log.warn('Event does not have a root folder path', { event });
        return false;
    }

    const folderPath = await getFolderPathForTalk({
        event,
        skipFilesystemAccess: true,
    });

    if (!folderPath) {
        log.warn('Could not get folder path for talk', { event });
        return false;
    }

    /* for await (const extension of validFileExtensions) {
        const file = pathUtils.join(folderPath, `${event.slug}${extension}`);

        try {
            await fs_promises.unlink(file);
            log.info(`Deleted file ${file}`);
        } catch (error) {
            log.error(`Could not delete file ${file}`, { error });
        }
    } */

    if (event.file && event.file.length > 0) {
        for await (const file of event.file) {
            // check if the file exists
            if (!file.path) {
                log.warn('File does not have a path', { file, event });
                continue;
            }

            const exists = await doesFileExist({ filePath: file.path });

            if (!exists) {
                log.warn(`File does not exist, cannot delete it`, {
                    filePath: file.path,
                    event,
                });
                continue;
            }

            try {
                await fs_promises.unlink(file.path);
                log.info(`Deleted file ${file.path}`, { event });
                await prisma.file.delete({
                    where: {
                        path: file.path,
                    },
                });
            } catch (error) {
                log.error(`Could not delete file ${file.path}`, {
                    error,
                    event,
                });

                return false;
            }
        }
    } else {
        log.warn('Event does not have any files to delete', { event });
    }

    // delete the folder if it is empty
    try {
        const files = await fs_promises.readdir(folderPath);

        if (files.length === 0) {
            await fs_promises.rmdir(folderPath);
            log.info(`Deleted empty folder ${folderPath}`);
            return true;
        }

        log.info(`Folder ${folderPath} is not empty, not deleting it`, {
            files,
        });
    } catch (error) {
        log.error(`Could not read or delete folder ${folderPath}`, { error });
    }

    return false;
};
