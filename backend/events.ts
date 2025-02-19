import type { Event as DbEvent, EventInfo, File } from '@prisma/client';

// eslint-disable-next-line import/no-cycle
import { startScanForMissingFiles } from '@backend/workers/scanForMissingFiles';

import { getFolderPathForTalk, isFolderMarked, isVideoFile } from '@backend/fs';
import type { ExistingFileWithGuessedInformation } from '@backend/fs/scan';
import type { components } from '@backend/generated/schema';
import { getConferenceFromEvent, getTalkFromApiBySlug } from '@backend/helper';
import rootLog from '@backend/rootLog';
import type {
    ApiEvent,
    ConvertBigintToNumberType,
    ConvertDateToStringType,
    ExtendedDbEvent,
    ImportJsonResponse,
    NormalAndConvertedDate,
    TalkInfo,
} from '@backend/types';
import { AddTalkFailure, ProblemType } from '@backend/types';

import { Prisma, PrismaClient } from '@prisma/client';

const log = rootLog.child({ label: 'events' });

export const mapResultFiles = ({
    file,
    rootFolderPath,
}: {
    file: File | ConvertDateToStringType<File>;
    rootFolderPath: string;
}): components['schemas']['DownloadedFile'] => ({
    filename: file.filename,
    root_folder: rootFolderPath,
    path: file.path,
    size: Number(file.bytes), // deal with bigint
    size_str: file.bytes.toString(),
    mime_type: file.mime,
    url: file.url,
    created: file.created as unknown as string,
    is_video: isVideoFile(file.path),
});

export const fixBigintInExtendedDbEvent = (
    data: ConvertDateToStringType<Omit<ExtendedDbEvent, 'recordings'>>,
): ConvertBigintToNumberType<typeof data & { duration_str: string }> => ({
    ...data,
    file:
        data.file?.map(file => ({
            ...file,
            bytes: Number(file.bytes),
            bytes_str: file.bytes.toString(),
        })) || null,
    duration: Number(data.duration),
    duration_str: data.duration.toString(),
});

export const addTalk = async ({
    event,
    rootFolder,
}: {
    event: ApiEvent;
    rootFolder: string;
}): Promise<
    ConvertDateToStringType<
        Omit<ExtendedDbEvent, 'recordings'> | AddTalkFailure
    >
> => {
    const prisma = new PrismaClient();

    try {
        const conference = await getConferenceFromEvent({ event });

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
                file: true,
                eventInfo: true,
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
            isKnownError: error instanceof Prisma.PrismaClientKnownRequestError,
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

export const listEvents = async (): Promise<
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
                eventInfo: true,
                file: true,
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

export const updateTalk = async ({
    guid,
    event,
}: {
    guid: string;
    event: ApiEvent;
}): Promise<DbEvent | false> => {
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

export const deleteTalk = async ({
    guid,
    deleteFiles = false,
}: {
    guid: string;
    deleteFiles: boolean;
}): Promise<boolean> => {
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

export const getTalkInfoByGuid = async ({
    guid,
}: {
    guid: string;
}): Promise<Omit<TalkInfo, 'status'> | null> => {
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

        const folder = await getFolderPathForTalk({ event: result });

        if (!folder) {
            log.warn('Folder not found for talk', { title: result.title });
            return null;
        }

        const mappedFiles = result.file.map<
            components['schemas']['DownloadedFile']
        >(file =>
            mapResultFiles({ file, rootFolderPath: result.root_folder.path }),
        );

        return {
            title: result.title,
            files: mappedFiles,
            root_folder: result.root_folder.path,
            download_progress: result.eventInfo.download_progress,
            is_downloading: result.eventInfo.is_downloading,
            download_error: result.eventInfo.download_error,
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

export const getTalkInfoBySlug = async ({
    slug,
}: {
    slug: string;
}): Promise<Omit<TalkInfo, 'status'> | null> => {
    const prisma = new PrismaClient();

    try {
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

        return await getTalkInfoByGuid({ guid: result.guid });
    } catch (error) {
        log.error('Error getting talk info by slug', { error, slug });

        throw error;
    } finally {
        await prisma.$disconnect();
    }
};

export const createNewTalkInfo = async ({
    talk,
}: {
    talk: ConvertBigintToNumberType<NormalAndConvertedDate<ExtendedDbEvent>>;
}): Promise<EventInfo['guid'] | null> => {
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

export const setDownloadProgress = async ({
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

export const setIsDownloading = async ({
    eventGuid,
    isDownloading,
}: {
    eventGuid: DbEvent['guid'];
    isDownloading: boolean;
}): Promise<void> => {
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

export const isEventDownloading = async ({
    eventInfoGuid,
    eventGuid,
    throwIfNotFound,
}:
    | {
          eventInfoGuid: EventInfo['guid'];
          eventGuid?: never;
          throwIfNotFound?: boolean;
      }
    | {
          eventGuid: DbEvent['guid'];
          eventInfoGuid?: never;
          throwIfNotFound?: boolean;
      }): Promise<boolean> => {
    const prisma = new PrismaClient();

    try {
        const result = await prisma.eventInfo.findFirst({
            where: eventGuid
                ? {
                      eventGuid,
                      is_downloading: true,
                  }
                : {
                      guid: eventInfoGuid,
                      is_downloading: true,
                  },
        });

        return !!result;
    } catch (error) {
        log.error('Error checking if event is downloading', {
            error,
            eventInfoGuid,
            eventGuid,
        });

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2021' && throwIfNotFound) {
                throw new Error('Event info not found');
            }
        }

        return false;
    } finally {
        await prisma.$disconnect();
    }
};

export const setDownloadError = async ({
    error,
    eventGuid,
    eventInfoGuid,
}:
    | {
          eventInfoGuid: EventInfo['guid'];
          eventGuid?: never;
          error: string;
      }
    | {
          eventGuid: DbEvent['guid'];
          eventInfoGuid?: never;
          error: string;
      }): Promise<void> => {
    const prisma = new PrismaClient();

    try {
        await prisma.eventInfo.update({
            where: eventGuid
                ? {
                      eventGuid,
                  }
                : {
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
            eventGuid,
        });

        if (db_error instanceof Prisma.PrismaClientKnownRequestError) {
            if (db_error.code === 'P2021') {
                log.error('Event info not found', { eventInfoGuid });
            }
        }
    } finally {
        await prisma.$disconnect();
    }
};

export const getDownloadError = async ({
    eventGuid,
    eventInfoGuid,
}:
    | {
          eventGuid: DbEvent['guid'];
          eventInfoGuid?: never;
      }
    | {
          eventInfoGuid: EventInfo['guid'];
          eventGuid?: never;
      }): Promise<string | null> => {
    const prisma = new PrismaClient();

    try {
        const result = await prisma.eventInfo.findFirst({
            where: eventGuid
                ? {
                      eventGuid,
                  }
                : {
                      guid: eventInfoGuid,
                  },
            select: {
                download_error: true,
            },
        });

        return result?.download_error || null;
    } catch (db_error) {
        log.error('Error getting download error', {
            db_error,
            eventGuid,
            eventInfoGuid,
        });

        return null;
    } finally {
        await prisma.$disconnect();
    }
};

export const clearDownloadError = async ({
    eventGuid,
    eventInfoGuid,
}:
    | {
          eventGuid: DbEvent['guid'];
          eventInfoGuid?: never;
      }
    | {
          eventInfoGuid: EventInfo['guid'];
          eventGuid?: never;
      }): Promise<void> => {
    const prisma = new PrismaClient();

    try {
        await prisma.eventInfo.update({
            where: eventGuid
                ? {
                      eventGuid,
                  }
                : {
                      guid: eventInfoGuid,
                  },
            data: {
                download_error: null,
            },
        });
    } catch (db_error) {
        log.error('Error clearing download error', { db_error, eventGuid });

        if (db_error instanceof Prisma.PrismaClientKnownRequestError) {
            if (db_error.code === 'P2021') {
                log.error('Event info not found', { eventGuid });
            }
        }
    } finally {
        await prisma.$disconnect();
    }
};

export const addDownloadedFile = async ({
    event,
    file,
    eventInfoGuid,
}: {
    event: ConvertBigintToNumberType<NormalAndConvertedDate<DbEvent>>;
    file: Omit<File, 'eventGuid'>;
    eventInfoGuid: EventInfo['guid'] | undefined;
}): Promise<boolean> => {
    const prisma = new PrismaClient();

    try {
        const res = await prisma.file.create({
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

        return !!res;
    } catch (error) {
        log.error('Error adding downloaded file', {
            error,
            file,
            title: event.title,
            guid: event.guid,
        });

        if (eventInfoGuid) {
            await setDownloadError({
                eventInfoGuid,
                error: 'Error adding downloaded file',
            });
        }

        throw error;
    } finally {
        await prisma.$disconnect();
    }
};

export const removeFileFromDatabase = async ({
    eventGuid,
    path,
}: {
    eventGuid: DbEvent['guid'];
    path: string;
}): Promise<boolean> => {
    const prisma = new PrismaClient();

    try {
        await prisma.file.deleteMany({
            where: {
                eventGuid,
                path,
            },
        });
    } catch (error) {
        log.error('Error removing file from database', {
            error,
            eventGuid,
            path,
        });

        return false;
    } finally {
        await prisma.$disconnect();
    }

    return true;
};

export const checkIfFileIsInDb = async ({
    eventGuid,
    path,
}: {
    eventGuid: DbEvent['guid'];
    path: string;
}): Promise<boolean> => {
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

export const setDownloadExitCode = async ({
    eventInfoGuid,
    eventGuid,
    exitCode,
}:
    | {
          eventInfoGuid: EventInfo['guid'];
          eventGuid?: never;
          exitCode: number | null;
      }
    | {
          eventInfoGuid?: never;
          eventGuid: DbEvent['guid'];
          exitCode: number | null;
      }): Promise<void> => {
    const prisma = new PrismaClient();

    try {
        await prisma.eventInfo.update({
            where: eventGuid ? { eventGuid } : { guid: eventInfoGuid },
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

export const getSpecificTalkByGuid = async <
    TEnableWithFiles extends boolean | undefined,
>({
    guid,
    withFiles = false,
}: {
    guid: string;
    withFiles?: TEnableWithFiles;
}): Promise<
    | (TEnableWithFiles extends true
          ? ExtendedDbEvent
          : Omit<ExtendedDbEvent, 'file'>)
    | null
> => {
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
                eventInfo: true,
                file: withFiles,
            },
        });
    } catch (error) {
        log.error('Error getting specific talk', { error, guid });

        return null;
    } finally {
        await prisma.$disconnect();
    }
};

export const getSpecificTalkBySlug = async <
    TEnableWithFiles extends boolean | undefined,
>({
    slug,
    withFiles = false,
}: {
    slug: string;
    withFiles?: TEnableWithFiles;
}): Promise<
    | (TEnableWithFiles extends true
          ? ExtendedDbEvent
          : Omit<ExtendedDbEvent, 'file'>)
    | null
> => {
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
                eventInfo: true,
                file: withFiles,
            },
        });
    } catch (error) {
        log.error('Error getting specific talk', { error, slug });

        return null;
    } finally {
        await prisma.$disconnect();
    }
};

export const getEventByFilePath = async ({
    filePath,
}: {
    filePath: string;
}): Promise<ExtendedDbEvent | null> => {
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
                        file: true,
                        eventInfo: true,
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

export const importExistingFileFromFilesystem = async ({
    rootFolder,
    file,
}: {
    rootFolder: string;
    file:
        | ExistingFileWithGuessedInformation
        | ConvertDateToStringType<ExistingFileWithGuessedInformation>;
}): Promise<boolean> => {
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

            await addTalk({ event: file.guess.event, rootFolder });
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

export const checkEventForProblems = async ({
    rootFolderPath,
    eventInfoGuid,
    downloadError,
}: {
    rootFolderPath: string;
} & (
    | {
          eventInfoGuid: EventInfo['guid'] | undefined;
          downloadError?: never;
      }
    | {
          eventInfoGuid?: never;
          downloadError: string | null | undefined;
      }
)): Promise<ProblemType[] | null> => {
    const problems: ProblemType[] = [];

    // ==== Start of problem checks ====

    if (!rootFolderPath) {
        log.debug('Event has no root folder', { rootFolderPath });

        problems.push(ProblemType.NoRootFolder);
    }

    if (!eventInfoGuid && typeof downloadError === 'undefined') {
        log.debug('Event has no event info', { eventInfoGuid });

        problems.push(ProblemType.NoEventInfoGuid);
    }

    const hasMark = await isFolderMarked({
        rootFolderPath,
    });

    if (!hasMark) {
        log.debug('Root folder is not marked', { rootFolderPath });

        problems.push(ProblemType.RootFolderMarkNotFound);
    }

    const downloadErrorResult =
        downloadError ||
        (eventInfoGuid
            ? await getDownloadError({
                  eventInfoGuid,
              })
            : null);

    if (downloadErrorResult) {
        log.debug('Download error found', { downloadErrorResult });

        problems.push(ProblemType.HasDownloadError);
    }

    // ==== End of problem checks ====

    if (!problems.length) {
        return null;
    }

    return problems;
};

export const importEventFahrplanJson = async ({
    slugs,
    rootFolder,
}: {
    slugs: string[];
    rootFolder: string;
}): Promise<ImportJsonResponse> => {
    if (!slugs.length) {
        return {
            successful_imports: [],
            existing_imports: [],
            total_imports: 0,
            parsed_slugs: [],
            errors: [],
        };
    }

    let slugsToImport = slugs.filter(Boolean);

    const existingImports: ImportJsonResponse['existing_imports'] = [];

    const successfulImports: ImportJsonResponse['successful_imports'] = [];

    const errors: ImportJsonResponse['errors'] = [];

    slugsToImport = Array.from(new Set(slugsToImport));

    // check with getSpecificTalkBySlug if the talk already exists
    for await (const slug of slugsToImport) {
        const existingTalk = await getSpecificTalkBySlug({ slug });

        if (existingTalk) {
            existingImports.push(slug);
        }
    }

    slugsToImport = slugsToImport.filter(
        slug => !existingImports.includes(slug),
    );

    for await (const slug of slugsToImport) {
        log.info('Importing talk', { slug });

        // implement it like importExistingFileFromFilesystem
        const apiEvent = await getTalkFromApiBySlug({ slug });

        if (!apiEvent) {
            log.error('Talk not found', { slug });

            errors.push({
                slug,
                error: 'Talk not found',
            });

            continue;
        }

        const result = await addTalk({ event: apiEvent, rootFolder });

        if (typeof result !== 'object') {
            log.error('Error adding talk to database', {
                result,
                slug,
            });

            errors.push({
                slug,
                error: 'Error adding talk to database',
            });

            continue;
        }

        successfulImports.push({
            slug,
            title: result.title,
        });

        await startScanForMissingFiles({
            event: fixBigintInExtendedDbEvent(result),
        });
    }

    return {
        existing_imports: existingImports,
        parsed_slugs: slugs,
        total_imports: slugsToImport.length,
        successful_imports: successfulImports,
        errors,
    };
};

export const clearDownloadingFlagForAllTalks = async (): Promise<void> => {
    const prisma = new PrismaClient();

    try {
        await prisma.eventInfo.updateMany({
            data: {
                is_downloading: false,
            },
        });
    } catch (error) {
        log.error('Error clearing downloading flag for all talks', { error });
    } finally {
        await prisma.$disconnect();
    }
};
