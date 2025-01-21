import type { Event as DbEvent, EventInfo, File } from '@prisma/client';

import { getFolderPathForTalk, isVideoFile } from '@backend/fs';
import type { ExistingFileWithGuessedInformation } from '@backend/fs/scan';
import type { components } from '@backend/generated/schema';
import { getConferenceFromEvent } from '@backend/helper';
import rootLog from '@backend/rootLog';
import type {
    ApiEvent,
    ConvertDateToStringType,
    ExtendedDbEvent,
    TalkInfo,
} from '@backend/types';
import { AddTalkFailure } from '@backend/types';

import { Prisma, PrismaClient } from '@prisma/client';

const log = rootLog.child({ label: 'talks' });

export const addTalk = async (
    event: ApiEvent,
    rootFolder: string,
): Promise<
    ConvertDateToStringType<
        Omit<ExtendedDbEvent, 'recordings'> | AddTalkFailure
    >
> => {
    const prisma = new PrismaClient();

    const conference = await getConferenceFromEvent(event);

    try {
        const createdTalk = await prisma.event.create({
            data: {
                guid: event.guid,
                title: event.title,
                description: event.description,
                date: event.date,
                frontend_link: event.frontend_link,
                persons: {
                    connectOrCreate: event.persons
                        .filter(Boolean)
                        .map(person => ({
                            where: { name: person },
                            create: { name: person },
                        })),
                },
                slug: event.slug,
                tags: {
                    connectOrCreate: event.tags.filter(Boolean).map(tag => ({
                        where: { name: tag },
                        create: { name: tag },
                    })),
                },
                root_folder: {
                    connectOrCreate: {
                        where: {
                            path: rootFolder,
                        },
                        create: {
                            path: rootFolder,
                        },
                    },
                },
                poster_url: event.poster_url,
                original_language: event.original_language,
                subtitle: event.subtitle,
                thumb_url: event.thumb_url,
                updated_at: event.updated_at,
                release_date: event.release_date,
                duration: event.duration,
                eventInfo: {
                    create: {
                        is_downloading: false,
                        download_progress: 0,
                    },
                },
                conference: {
                    ...(conference
                        ? {
                              connectOrCreate: {
                                  where: {
                                      title: event.conference_title,
                                  },
                                  create: {
                                      acronym: conference.acronym,
                                      description: conference.description,
                                      updated_at: conference.updated_at,
                                      aspect_ratio: conference.aspect_ratio,
                                      schedule_url: conference.schedule_url,
                                      slug: conference.slug,
                                      title: conference.title,
                                      url: conference.url,
                                      logo_url: conference.logo_url,
                                  },
                              },
                          }
                        : {}),
                },
            },
            include: {
                persons: true,
                tags: true,
                conference: true,
                root_folder: true,
            },
        });

        log.info('Created talk', { createdTalk });

        return createdTalk as unknown as ConvertDateToStringType<
            typeof createdTalk
        >;
    } catch (error) {
        log.error('Error creating talk', {
            error:
                error instanceof Prisma.PrismaClientKnownRequestError
                    ? error.code
                    : error,
            title: event.title,
            guid: event.guid,
        });

        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
        ) {
            return AddTalkFailure.Duplicate;
        }

        return AddTalkFailure.Other;
    } finally {
        await prisma.$disconnect();
    }
};

export const listTalks = async (): Promise<
    ConvertDateToStringType<ExtendedDbEvent>[]
> => {
    const prisma = new PrismaClient();

    try {
        const result = await prisma.event.findMany({
            include: {
                persons: true,
                tags: true,
                conference: true,
                root_folder: true,
            },
        });

        return result as unknown as ConvertDateToStringType<
            (typeof result)[0]
        >[];
    } catch (error) {
        log.error('Error listing talks', { error });

        return [];
    } finally {
        await prisma.$disconnect();
    }
};

export const simpleListTalks = async (): Promise<DbEvent[]> => {
    const prisma = new PrismaClient();

    try {
        return await prisma.event.findMany();
    } catch (error) {
        log.error('Error listing talks', { error });

        return [];
    } finally {
        await prisma.$disconnect();
    }
};

export const updateTalk = async (
    guid: string,
    event: ApiEvent,
): Promise<DbEvent | false> => {
    const prisma = new PrismaClient();

    try {
        const updatedTalk = await prisma.event.update({
            where: {
                guid,
            },
            data: {
                title: event.title,
                description: event.description,
                date: event.date,
                frontend_link: event.frontend_link,
                persons: {
                    connectOrCreate: event.persons.map(person => ({
                        where: { name: person },
                        create: { name: person },
                    })),
                },
                slug: event.slug,
                tags: {
                    connectOrCreate: event.tags.map(tag => ({
                        where: { name: tag },
                        create: { name: tag },
                    })),
                },
                poster_url: event.poster_url,
                original_language: event.original_language,
                subtitle: event.subtitle,
                thumb_url: event.thumb_url,
                updated_at: event.updated_at,
                release_date: event.release_date,
            },
        });

        log.info('Updated talk', { updatedTalk });

        return updatedTalk;
    } catch (error) {
        log.error('Error updating talk', { error, title: event.title, guid });

        return false;
    } finally {
        await prisma.$disconnect();
    }
};

export const deleteTalk = async (
    guid: string,
    { deleteFiles = false }: { deleteFiles: boolean },
): Promise<boolean> => {
    const prisma = new PrismaClient();

    if (deleteFiles) {
        // TODO: Implement file deletion
        log.warn('Deleting files is not implemented yet');
    }

    try {
        await prisma.event.delete({
            where: {
                guid,
            },
            include: {
                eventInfo: true,
                file: true,
            },
        });

        return true;
    } catch (error) {
        log.error('Error deleting talk', { error, guid });

        return false;
    } finally {
        await prisma.$disconnect();
    }
};

export const getTalkInfoByGuid = async (
    guid: string,
): Promise<TalkInfo | null> => {
    const prisma = new PrismaClient();

    try {
        const result = await prisma.event.findUnique({
            where: {
                guid,
            },
            include: {
                root_folder: true,
                file: true,
                eventInfo: true,
                conference: true,
            },
        });

        if (!result) {
            log.warn('Talk not found', { guid });
            return null;
        }

        if (!result.eventInfo) {
            log.warn('Event info not found for talk', { title: result.title });
            return null;
        }

        const folder = await getFolderPathForTalk(result);

        if (!folder) {
            log.warn('Folder not found for talk', { title: result.title });
            return null;
        }

        const mappedFiles = await Promise.all(
            result.file.map<Promise<components['schemas']['DownloadedFile']>>(
                async file => ({
                    filename: file.filename,
                    root_folder: result.root_folder.path,
                    path: file.path,
                    size: file.bytes,
                    mime_type: file.mime,
                    url: file.url,
                    created: file.created as unknown as string,
                    is_video: isVideoFile(file.path),
                }),
            ),
        );

        return {
            title: result.title,
            files: mappedFiles,
            root_folder: result.root_folder.path,
            download_progress: result.eventInfo.download_progress,
            is_downloading: result.eventInfo.is_downloading,
            has_files: result.file.length > 0,
            folder,
        };
    } catch (error) {
        log.error('Error getting talk info', { error, guid });
    } finally {
        await prisma.$disconnect();
    }

    return null;
};

export const getTalkInfoBySlug = async (
    slug: string,
): Promise<TalkInfo | null> => {
    const prisma = new PrismaClient();

    // get guid and call getTalkInfoByGuid
    const result = await prisma.event.findFirst({
        where: {
            slug,
        },
        select: {
            guid: true,
        },
    });

    if (!result) {
        return null;
    }

    return getTalkInfoByGuid(result.guid);
};

export const createNewTalkInfo = async (
    talk: ExtendedDbEvent | ConvertDateToStringType<ExtendedDbEvent>,
): Promise<EventInfo['guid'] | null> => {
    const prisma = new PrismaClient();

    // check if eventinfo already exists

    try {
        const exists = await prisma.eventInfo.findMany({
            where: {
                event: {
                    guid: talk.guid,
                },
            },
        });

        if (exists.length === 1) {
            return exists[0].guid;
        }

        if (exists.length > 1) {
            log.error(
                `More than one event info found for talk ${talk.guid} (This should not be possible)`,
                {
                    count: exists.length,
                },
            );

            return null;
        }

        const result = await prisma.eventInfo.create({
            data: {
                event: {
                    connect: {
                        guid: talk.guid,
                    },
                },
                is_downloading: false,
                download_progress: 0,
            },
            select: {
                guid: true,
            },
        });

        return result.guid;
    } catch (error) {
        log.error('Error creating new talk info', {
            error,
            title: talk.title,
            guid: talk.guid,
        });
    } finally {
        await prisma.$disconnect();
    }

    return null;
};

export const updateDownloadProgress = async ({
    eventGuid,
    progress,
}: {
    eventGuid: DbEvent['guid'];
    progress: number;
}): Promise<void> => {
    const prisma = new PrismaClient();

    try {
        await prisma.eventInfo.update({
            where: {
                eventGuid,
            },
            data: {
                download_progress: progress,
            },
        });
    } catch (error) {
        log.error('Error updating download progress', {
            error,
            eventGuid,
            progress,
        });
    } finally {
        await prisma.$disconnect();
    }
};

export const setIsDownloading = async (
    eventGuid: DbEvent['guid'],
    isDownloading: boolean,
): Promise<void> => {
    const prisma = new PrismaClient();

    try {
        await prisma.eventInfo.update({
            where: {
                eventGuid,
            },
            data: {
                is_downloading: isDownloading,
            },
        });
    } catch (error) {
        log.error('Error setting is downloading', {
            error,
            eventGuid,
            isDownloading,
        });
    } finally {
        await prisma.$disconnect();
    }
};

export const isEventDownloading = async (
    eventInfoGuid: EventInfo['guid'],
): Promise<boolean> => {
    const prisma = new PrismaClient();

    try {
        const result = await prisma.eventInfo.findFirst({
            where: {
                guid: eventInfoGuid,
                is_downloading: true,
            },
        });

        return !!result;
    } catch (error) {
        log.error('Error checking if event is downloading', {
            error,
            eventInfoGuid,
        });

        return false;
    } finally {
        await prisma.$disconnect();
    }
};

export const addDownloadedFile = async (
    event: DbEvent | ConvertDateToStringType<DbEvent>,
    file: Omit<File, 'eventGuid'>,
): Promise<boolean> => {
    const prisma = new PrismaClient();

    try {
        await prisma.file.create({
            data: {
                event: {
                    connect: {
                        guid: event.guid,
                    },
                },
                filename: file.filename,
                url: file.url,
                path: file.path,
                bytes: file.bytes,
                created: file.created,
                mime: file.mime,
                is_video: file.is_video,
            },
        });
    } catch (error) {
        log.error('Error adding downloaded file', {
            error,
            file,
            title: event.title,
            guid: event.guid,
        });

        return false;
    } finally {
        await prisma.$disconnect();
    }

    return true;
};

export const checkIfFileIsInDb = async (
    eventGuid: DbEvent['guid'],
    path: string,
): Promise<boolean> => {
    const prisma = new PrismaClient();

    try {
        const result = await prisma.file.findFirst({
            where: {
                eventGuid,
                path,
            },
        });

        return !!result;
    } catch (error) {
        log.error('Error checking if file is in db', {
            error,
            eventGuid,
            path,
        });

        return false;
    } finally {
        await prisma.$disconnect();
    }
};

export const setDownloadError = async (
    eventInfoGuid: EventInfo['guid'],
    error: string,
): Promise<void> => {
    const prisma = new PrismaClient();

    try {
        await prisma.eventInfo.update({
            where: {
                guid: eventInfoGuid,
            },
            data: {
                download_error: error,
            },
        });
    } catch (db_error) {
        log.error('Error setting download error', {
            db_error,
            error,
            eventInfoGuid,
        });
    } finally {
        await prisma.$disconnect();
    }
};

export const clearDownloadError = async (
    eventInfoGuid: EventInfo['guid'],
): Promise<void> => {
    const prisma = new PrismaClient();

    try {
        await prisma.eventInfo.update({
            where: {
                guid: eventInfoGuid,
            },
            data: {
                download_error: null,
            },
        });
    } catch (db_error) {
        log.error('Error clearing download error', { db_error, eventInfoGuid });
    } finally {
        await prisma.$disconnect();
    }
};

export const setDownloadExitCode = async (
    eventInfoGuid: EventInfo['guid'],
    exitCode: number | null,
): Promise<void> => {
    const prisma = new PrismaClient();

    try {
        await prisma.eventInfo.update({
            where: {
                guid: eventInfoGuid,
            },
            data: {
                download_exit_code: exitCode,
            },
        });
    } catch (db_error) {
        log.error('Error setting download exit code', {
            db_error,
            exitCode,
            eventInfoGuid,
        });
    } finally {
        await prisma.$disconnect();
    }
};

export const getSpecificTalkByGuid = async (
    guid: string,
): Promise<ExtendedDbEvent | null> => {
    const prisma = new PrismaClient();

    try {
        return await prisma.event.findUnique({
            where: {
                guid,
            },
            include: {
                persons: true,
                tags: true,
                conference: true,
                root_folder: true,
            },
        });
    } catch (error) {
        log.error('Error getting specific talk', { error, guid });

        return null;
    } finally {
        await prisma.$disconnect();
    }
};

export const getSpecificTalkBySlug = async (
    slug: string,
): Promise<ExtendedDbEvent | null> => {
    const prisma = new PrismaClient();

    try {
        return await prisma.event.findFirst({
            where: {
                slug,
            },
            include: {
                persons: true,
                tags: true,
                conference: true,
                root_folder: true,
            },
        });
    } catch (error) {
        log.error('Error getting specific talk', { error, slug });

        return null;
    } finally {
        await prisma.$disconnect();
    }
};

export const getEventByFilePath = async (
    filePath: string,
): Promise<ExtendedDbEvent | null> => {
    const prisma = new PrismaClient();

    try {
        const result = await prisma.file.findFirst({
            where: {
                path: {
                    contains: filePath,
                },
            },
            include: {
                event: {
                    include: {
                        persons: true,
                        tags: true,
                        conference: true,
                        root_folder: true,
                    },
                },
            },
        });

        if (!result) {
            log.warn('Event not found by file path', { filePath });
            return null;
        }

        return result.event;
    } catch (error) {
        log.error('Error getting event by file path', { error, filePath });

        return null;
    } finally {
        await prisma.$disconnect();
    }
};

export const importExistingFileFromFilesystem = async (
    rootFolder: string,
    file:
        | ExistingFileWithGuessedInformation
        | ConvertDateToStringType<ExistingFileWithGuessedInformation>,
): Promise<boolean> => {
    // We need to follow these steps:
    // 1. Check if conference exists in db. If not, create it.
    // 2. Check if event exists in db. If not, create it.
    // 3. Create the file in db. If it already exists, skip it.

    if (!file.guess.conferenceAcronym || !file.guess.conference) {
        log.warn('Conference acronym or title is missing', { file });

        return false;
    }

    if (!file.guess.slug || !file.guess.event) {
        log.warn('Event or slug is missing', { file });

        return false;
    }

    const prisma = new PrismaClient();

    try {
        let conference = await prisma.conference.findFirst({
            where: {
                acronym: file.guess.conferenceAcronym,
            },
        });

        if (!conference) {
            log.warn('Conference does not exist in db', {
                acronym: file.guess.conferenceAcronym,
            });
        }

        let event = await prisma.event.findFirst({
            where: {
                slug: file.guess.slug,
            },
        });

        if (!event) {
            log.warn('Event does not exist in db', { slug: file.guess.slug });

            await addTalk(file.guess.event, rootFolder);
        }

        conference = await prisma.conference.findFirst({
            where: {
                acronym: file.guess.conferenceAcronym,
            },
        });

        if (!conference) {
            log.error('Conference still does not exist in db after adding', {
                acronym: file.guess.conferenceAcronym,
            });

            return false;
        }

        event = await prisma.event.findFirst({
            where: {
                slug: file.guess.slug,
            },
        });

        if (!event) {
            log.error('Event still does not exist in db after adding', {
                slug: file.guess.slug,
            });

            return false;
        }

        const filesForGuid = await prisma.file.findMany({
            where: {
                eventGuid: event.guid,
            },
        });

        if (filesForGuid?.length) {
            const fileExists = filesForGuid.some(
                dbFile => dbFile.path === file.path,
            );

            if (fileExists) {
                log.warn('File already exists in db', {
                    file: file.path,
                    filesInDb: filesForGuid,
                });

                return false;
            }
        }

        const createdFile = await prisma.file.create({
            data: {
                event: {
                    connect: {
                        guid: event.guid,
                    },
                },
                filename: file.filename,
                url: file.guess.event.frontend_link,
                mime: file.mime,
                is_video: file.isVideo,
                created: file.createdAt,
                bytes: file.size,
                path: file.path,
            },
        });

        log.info('Created file', { createdFile: createdFile.path });

        return true;
    } catch (error) {
        log.error('Error importing file', { error, file });

        return false;
    } finally {
        await prisma.$disconnect();
    }
};
