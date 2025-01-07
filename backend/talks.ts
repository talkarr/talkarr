import { getDownloadedFileInfo } from '@backend/fs';
import type { components } from '@backend/generated/schema';
import { getConferenceFromEvent } from '@backend/helper';
import rootLog from '@backend/rootLog';
import type {
    Conference,
    Event as DbEvent,
    EventInfo,
    File,
    Person,
    RootFolder,
    Tag,
} from '@prisma/client';
import { Prisma, PrismaClient } from '@prisma/client';

const log = rootLog.child({ label: 'talks' });

export type ApiEvent = components['schemas']['Event'];

export type TalkInfo = components['schemas']['TalkInfo'];

export enum AddTalkFailure {
    Duplicate,
    Other,
}

export interface ExtendedDbEvent extends DbEvent {
    persons: Person[];
    tags: Tag[];
    conference: Conference;
    root_folder: RootFolder;
}

export const addTalk = async (
    event: ApiEvent,
    rootFolder: string,
): Promise<ExtendedDbEvent | AddTalkFailure> => {
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

        log.info('Created talk', createdTalk);

        return createdTalk;
    } catch (error) {
        log.error(
            'Error creating talk',
            error instanceof Prisma.PrismaClientKnownRequestError
                ? error.code
                : error,
        );

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

export const listTalks = async (): Promise<ExtendedDbEvent[]> => {
    const prisma = new PrismaClient();

    try {
        return await prisma.event.findMany({
            include: {
                persons: true,
                tags: true,
                conference: true,
                root_folder: true,
            },
        });
    } catch (error) {
        log.error('Error listing talks', error);

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
        log.error('Error listing talks', error);

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

        log.info('Updated talk', updatedTalk);

        return updatedTalk;
    } catch (error) {
        log.error('Error updating talk', error);

        return false;
    } finally {
        await prisma.$disconnect();
    }
};

export const deleteTalk = async (guid: string): Promise<boolean> => {
    const prisma = new PrismaClient();

    try {
        await prisma.event.delete({
            where: {
                guid,
            },
        });

        return true;
    } catch (error) {
        log.error('Error deleting talk', error);

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
            },
        });

        if (!result) {
            return null;
        }

        const mappedFiles = await Promise.all(
            result.file.map(async file => {
                const fileInfo = await getDownloadedFileInfo(file.path);

                return {
                    filename: file.filename,
                    root_folder: result.root_folder.path,
                    path: file.path,
                    size: fileInfo.size,
                    mime_type: fileInfo.mime_type,
                } as components['schemas']['DownloadedFile'];
            }),
        );

        console.log('eventinfo', result.eventInfo);

        return {
            files: mappedFiles,
            root_folder: result.root_folder.path,
            download_progress: result.eventInfo.download_progress,
            is_downloading: result.eventInfo.is_downloading,
            has_files: result.file.length > 0,
        };
    } catch (error) {
        log.error('Error getting talk info', error);
    } finally {
        await prisma.$disconnect();
    }

    return null;
};

export const createNewTalkInfo = async (
    talk: ExtendedDbEvent,
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
        log.error('Error creating new talk info', error);
    } finally {
        await prisma.$disconnect();
    }

    return null;
};

export const updateDownloadProgress = async ({
    eventInfoGuid,
    progress,
}: {
    eventInfoGuid: EventInfo['guid'];
    progress: number;
}): Promise<void> => {
    const prisma = new PrismaClient();

    try {
        await prisma.eventInfo.update({
            where: {
                guid: eventInfoGuid,
            },
            data: {
                download_progress: progress,
            },
        });
    } catch (error) {
        log.error('Error updating download progress', error);
    } finally {
        await prisma.$disconnect();
    }
};

export const setIsDownloading = async (
    eventInfoGuid: EventInfo['guid'],
    isDownloading: boolean,
): Promise<void> => {
    const prisma = new PrismaClient();

    try {
        await prisma.eventInfo.update({
            where: {
                guid: eventInfoGuid,
            },
            data: {
                is_downloading: isDownloading,
            },
        });
    } catch (error) {
        log.error('Error setting is downloading', error);
    } finally {
        await prisma.$disconnect();
    }
};

export const addDownloadedFile = async (
    event: DbEvent,
    file: Omit<File, 'eventGuid' | 'created'>,
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
            },
        });
    } catch (error) {
        log.error('Error adding downloaded file', error);

        return false;
    } finally {
        await prisma.$disconnect();
    }

    return true;
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
        log.error('Error setting download error', db_error);
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
        log.error('Error clearing download error', db_error);
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
        log.error('Error setting download exit code', db_error);
    } finally {
        await prisma.$disconnect();
    }
};
