import type {
    Conference as DbConference,
    Event as DbEvent,
    EventInfo,
    File,
} from '@prisma/client';

import { isBlurhashValid } from 'blurhash';

// eslint-disable-next-line import/no-cycle
import { startScanForMissingFiles } from '@backend/workers/scan-for-missing-files';

import {
    deleteFilesForEvent,
    getFolderPathForTalk,
    isFolderMarked,
    isVideoFile,
} from '@backend/fs';
import type { ExistingFileWithGuessedInformation } from '@backend/fs/scan';
import type { components } from '@backend/generated/schema';
import { getConferenceFromEvent, getTalkFromApiBySlug } from '@backend/helper';
import { serverDecodeCustomBlurhash } from '@backend/helper/blurhash';
import { prisma } from '@backend/prisma';
import rootLog from '@backend/root-log';
import { getSettings } from '@backend/settings';
import type {
    ApiEvent,
    ConvertBigintToNumberType,
    ConvertDateToStringType,
    EventFahrplanJsonImport,
    ExtendedDbEvent,
    ImportJsonResponse,
    NormalAndConvertedDate,
    TalkInfo,
} from '@backend/types';
import { AddTalkFailure } from '@backend/types';
import { ImportIsRecordedFlagBehavior } from '@backend/types/settings';

import { EventProblemType, Prisma } from '@prisma/client';

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
                    connect: {
                        path: rootFolder,
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
                                      acronym: conference.acronym,
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
            error,
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
    }
};

export const listEvents = async (): Promise<
    ConvertDateToStringType<ExtendedDbEvent>[]
> => {
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
            orderBy: {
                date_added: 'desc',
            },
        });

        return result as unknown as ConvertDateToStringType<
            (typeof result)[0]
        >[];
    } catch (error) {
        log.error('Error listing talks', { error });

        return [];
    }
};

export const simpleListTalks = async (): Promise<DbEvent[]> => {
    try {
        return await prisma.event.findMany({
            orderBy: {
                date_added: 'desc',
            },
        });
    } catch (error) {
        log.error('Error listing talks', { error });

        return [];
    }
};

export const updateTalk = async ({
    guid,
    event,
}: {
    guid: string;
    event: ApiEvent;
}): Promise<DbEvent | false> => {
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
    }
};

export const getTalkInfoByGuid = async ({
    guid,
}: {
    guid: string;
}): Promise<{
    talkInfo: Omit<TalkInfo, 'status'> | null;
    guid: string | null;
}> => {
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
            return { talkInfo: null, guid };
        }

        if (!result.eventInfo) {
            log.warn('Event info not found for talk', { title: result.title });
            return { talkInfo: null, guid };
        }

        const folder = await getFolderPathForTalk({
            event: result,
            skipFilesystemAccess: true,
        });

        if (!folder) {
            log.warn('Folder not found for talk', { title: result.title });
            return { talkInfo: null, guid };
        }

        const mappedFiles = result.file.map<
            components['schemas']['DownloadedFile']
        >(file =>
            mapResultFiles({ file, rootFolderPath: result.root_folder.path }),
        );

        return {
            talkInfo: {
                title: result.title,
                files: mappedFiles,
                root_folder: result.root_folder.path,
                download_progress: result.eventInfo.download_progress,
                is_downloading: result.eventInfo.is_downloading,
                download_error: result.eventInfo.download_error,
                has_files: result.file.length > 0,
                folder,
            },
            guid,
        };
    } catch (error) {
        log.error('Error getting talk info', { error, guid });
    }

    return { talkInfo: null, guid };
};

export const getTalkInfoBySlug = async ({
    slug,
}: {
    slug: string;
}): Promise<Awaited<ReturnType<typeof getTalkInfoByGuid>>> => {
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
            return { talkInfo: null, guid: null };
        }

        return await getTalkInfoByGuid({ guid: result.guid });
    } catch (error) {
        log.error('Error getting talk info by slug', { error, slug });

        throw error;
    }
};

export const deleteTalk = async ({
    guid,
    deleteFiles = false,
}: {
    guid: string;
    deleteFiles: boolean;
}): Promise<boolean> => {
    if (deleteFiles) {
        const event = (await prisma.event.findUnique({
            where: {
                guid,
            },
            include: {
                persons: true,
                tags: true,
                file: true,
                root_folder: true,
                conference: true,
            },
        })) as ConvertBigintToNumberType<
            NormalAndConvertedDate<ExtendedDbEvent>
        > | null;

        if (!event) {
            log.error('Event not found for deletion', { guid });
            return false;
        }

        const deleteSuccess = await deleteFilesForEvent({
            event,
        });

        if (!deleteSuccess) {
            log.error('Error deleting files for talk', { guid });
            return false;
        }
    }

    try {
        await prisma.event.delete({
            where: {
                guid,
            },
        });

        return true;
    } catch (error) {
        log.error('Error deleting talk', { error, guid });

        return false;
    }
};

export const createNewTalkInfo = async ({
    talk,
}: {
    talk: ConvertBigintToNumberType<NormalAndConvertedDate<ExtendedDbEvent>>;
}): Promise<{ guid: EventInfo['guid']; isNew: boolean } | null> => {
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
            return { guid: exists[0].guid, isNew: false };
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

        return { guid: result.guid, isNew: true };
    } catch (error) {
        log.error('Error creating new talk info', {
            error,
            title: talk.title,
            guid: talk.guid,
        });
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
    }
};

export const setIsDownloading = async ({
    eventGuid,
    isDownloading,
}: {
    eventGuid: DbEvent['guid'];
    isDownloading: boolean;
}): Promise<void> => {
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
            // eslint-disable-next-line unicorn/no-lonely-if
            if (error.code === 'P2021' && throwIfNotFound) {
                throw new Error('Event info not found');
            }
        }

        return false;
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
            // eslint-disable-next-line unicorn/no-lonely-if
            if (db_error.code === 'P2021') {
                log.error('Event info not found', { eventInfoGuid });
            }
        }
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
            // eslint-disable-next-line unicorn/no-lonely-if
            if (db_error.code === 'P2021') {
                log.error('Event info not found', { eventGuid });
            }
        }
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
                error: `Error adding downloaded file: ${error instanceof Error ? error.message : 'unknown message'}`,
            });
        }

        throw error;
    }
};

export const removeFileFromDatabase = async ({
    eventGuid,
    path,
}: {
    eventGuid: DbEvent['guid'];
    path: string;
}): Promise<boolean> => {
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
    }
};

export const getEventByFilePath = async ({
    filePath,
}: {
    filePath: string;
}): Promise<ExtendedDbEvent | null> => {
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
            log.warn('Event not found in database by file path', { filePath });
            return null;
        }

        return result.event;
    } catch (error) {
        log.error('Error getting event from database by file path', {
            error,
            filePath,
        });

        return null;
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
    }
};

export const checkEventForProblems = async ({
    rootFolderPath,
    eventInfoGuid,
    downloadError,
    cacheFilesystemCheck,
}: {
    rootFolderPath: string;
    // if forceFilesystemCheck is false, the filesystem check will be cached for 5 minutes
    cacheFilesystemCheck: boolean;
} & (
    | {
          eventInfoGuid: EventInfo['guid'] | undefined;
          downloadError?: never;
      }
    | {
          eventInfoGuid?: never;
          downloadError: string | null | undefined;
      }
)): Promise<EventProblemType[] | null> => {
    const problems: EventProblemType[] = [];

    // ==== Start of problem checks ====

    if (!rootFolderPath) {
        log.debug('Event has no root folder', { rootFolderPath });

        problems.push(EventProblemType.NoRootFolder);
    }

    if (!eventInfoGuid && typeof downloadError === 'undefined') {
        log.debug('Event has no event info', { eventInfoGuid });

        problems.push(EventProblemType.NoEventInfoGuid);
    }

    const hasMark = await isFolderMarked({
        rootFolderPath,
        cacheFilesystemCheck,
    });

    if (!hasMark) {
        log.debug('Root folder is not marked', { rootFolderPath });

        problems.push(EventProblemType.RootFolderMarkNotFound);
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

        problems.push(EventProblemType.HasDownloadError);
    }

    // ==== End of problem checks ====

    if (problems.length === 0) {
        return null;
    }

    return problems;
};

export const importEventFahrplanJson = async ({
    lectures,
    rootFolder,
}: {
    lectures: EventFahrplanJsonImport['lectures'];
    rootFolder: string;
}): Promise<ImportJsonResponse> => {
    if (lectures.length === 0) {
        return {
            successful_imports: [],
            existing_imports: [],
            total_imports: 0,
            parsed_slugs: [],
            errors: [],
        };
    }

    const slugs = lectures.map(lecture => lecture.slug);
    let slugsToImport = slugs.filter(
        slug => slug && slug.length > 0,
    ) as string[];

    const existingImports: ImportJsonResponse['existing_imports'] = [];

    const successfulImports: ImportJsonResponse['successful_imports'] = [];

    const errors: ImportJsonResponse['errors'] = [];

    slugsToImport = [...new Set(slugsToImport)];

    // check with getSpecificTalkBySlug if the talk already exists
    await Promise.all(
        slugsToImport.map(async slug => {
            const existingTalk = await getSpecificTalkBySlug({
                slug,
            });

            if (existingTalk) {
                existingImports.push(slug);
            }
        }),
    );

    slugsToImport = slugsToImport.filter(
        slug => !existingImports.includes(slug),
    );

    const {
        general: { importIsRecordedFlagBehavior },
    } = getSettings();

    for await (const slug of slugsToImport) {
        log.info('Importing talk', { slug });
        const lecture = lectures.find(l => l.slug === slug);

        const wasRecorded = lecture?.recorded;

        if (
            importIsRecordedFlagBehavior !==
            ImportIsRecordedFlagBehavior.alwaysImport
        ) {
            if (
                importIsRecordedFlagBehavior ===
                    ImportIsRecordedFlagBehavior.skipImportIfFlagNotExists &&
                typeof wasRecorded === 'undefined'
            ) {
                log.warn('Talk was not recorded, skipping import', { slug });

                errors.push({
                    slug,
                    title: lecture?.title || '',
                    isRecorded: wasRecorded ?? null,
                    error: 'Talk recorded flag does not exist',
                });

                continue;
            }

            if (
                importIsRecordedFlagBehavior ===
                    ImportIsRecordedFlagBehavior.skipImportIfIsNotRecorded &&
                wasRecorded === false
            ) {
                log.warn('Talk was not recorded, skipping import', { slug });

                errors.push({
                    slug,
                    title: lecture?.title || '',
                    isRecorded: wasRecorded,
                    error: 'Talk was not recorded',
                });

                continue;
            }
        }

        let apiEvent;

        try {
            // implement it like importExistingFileFromFilesystem
            apiEvent = await getTalkFromApiBySlug({ slug });

            if (!apiEvent) {
                log.error('Talk not found', { slug });

                errors.push({
                    slug,
                    title: lecture?.title || '',
                    isRecorded: wasRecorded ?? null,
                    error: 'Talk not found',
                });

                continue;
            }
        } catch (error) {
            log.error('Error fetching talk from API', {
                error,
                slug,
                title: lecture?.title || '<no title found>',
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
                title: lecture?.title || '',
                isRecorded: wasRecorded ?? null,
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
    try {
        await prisma.eventInfo.updateMany({
            data: {
                is_downloading: false,
            },
        });
    } catch (error) {
        log.error('Error clearing downloading flag for all talks', { error });
    }
};

export const listTalkFiles = async ({
    eventGuid,
}: {
    eventGuid: DbEvent['guid'];
}): Promise<components['schemas']['DownloadedFile'][]> => {
    try {
        const result = await prisma.file.findMany({
            where: {
                eventGuid,
            },
        });

        return result.map(file =>
            mapResultFiles({ file, rootFolderPath: file.path }),
        );
    } catch (error) {
        log.error('Error listing talk files', { error, eventGuid });

        return [];
    }
};

export const getConferencesWithMissingBlurhash = async (): Promise<
    DbConference[]
> => {
    try {
        const conferences = await prisma.conference.findMany({});

        if (conferences.length === 0) {
            return [];
        }

        return conferences.filter(c => {
            if (!c.logo_url) {
                return false;
            }

            if (!c.logo_url_blur || c.logo_url_blur === '') {
                return true;
            }

            const decoded = serverDecodeCustomBlurhash(c.logo_url_blur);

            if (!decoded) {
                return true;
            }

            return !isBlurhashValid(decoded.blurhash).result;
        });
    } catch (error) {
        log.error('Error getting conferences with missing blurhash', { error });

        return [];
    }
};

export const setConferenceLogoBlurhash = async ({
    acronym,
    blurHash,
}: {
    acronym: DbConference['acronym'];
    blurHash: string;
}): Promise<boolean> => {
    try {
        await prisma.conference.updateMany({
            where: {
                acronym,
            },
            data: {
                logo_url_blur: blurHash,
            },
        });

        return true;
    } catch (error) {
        log.error('Error setting conference logo blurhash', { error, acronym });

        return false;
    }
};

export const getEventsWithMissingBlurhash = async ({
    overrideEvents,
    force = false,
}: {
    overrideEvents?: (
        | DbEvent
        | ConvertBigintToNumberType<NormalAndConvertedDate<ExtendedDbEvent>>
    )[];
    force?: boolean;
}): Promise<DbEvent[]> => {
    try {
        const events = await prisma.event.findMany({});

        const eventsFound = events.filter(e => {
            if (force) {
                return true;
            }

            const decodedPoster =
                (e.poster_url_blur
                    ? serverDecodeCustomBlurhash(e.poster_url_blur)?.blurhash
                    : null) || '';
            const decodedThumb =
                (e.thumb_url_blur
                    ? serverDecodeCustomBlurhash(e.thumb_url_blur)?.blurhash
                    : null) || '';

            const posterMissing =
                !e.poster_url ||
                !e.poster_url_blur ||
                e.poster_url_blur === '' ||
                !isBlurhashValid(decodedPoster).result;

            const thumbMissing =
                !e.thumb_url ||
                !e.thumb_url_blur ||
                e.thumb_url_blur === '' ||
                !isBlurhashValid(decodedThumb).result;

            return posterMissing || thumbMissing;
        });

        if (eventsFound.length === 0) {
            return [];
        }

        if (overrideEvents) {
            const overrideGuids = new Set(overrideEvents.map(e => e.guid));
            return eventsFound.filter(e => overrideGuids.has(e.guid));
        }

        return eventsFound;
    } catch (error) {
        log.error('Error getting events with missing blurhash', { error });

        return [];
    }
};

export const setEventPosterBlurhash = async ({
    guid,
    blurHash,
}: {
    guid: DbEvent['guid'];
    blurHash: string;
}): Promise<boolean> => {
    try {
        await prisma.event.updateMany({
            where: {
                guid,
            },
            data: {
                poster_url_blur: blurHash,
            },
        });

        return true;
    } catch (error) {
        log.error('Error setting event poster blurhash', { error, guid });

        return false;
    }
};

export const setEventThumbBlurhash = async ({
    guid,
    blurHash,
}: {
    guid: DbEvent['guid'];
    blurHash: string;
}): Promise<boolean> => {
    try {
        await prisma.event.updateMany({
            where: {
                guid,
            },
            data: {
                thumb_url_blur: blurHash,
            },
        });

        return true;
    } catch (error) {
        log.error('Error setting event thumb blurhash', { error, guid });

        return false;
    }
};

export const updateEventProblems = async ({
    guid,
    problems,
}: {
    guid: DbEvent['guid'];
    problems: EventProblemType[];
}): Promise<boolean> => {
    try {
        await prisma.event.updateMany({
            where: {
                guid,
            },
            data: {
                problems,
            },
        });

        return true;
    } catch (error) {
        log.error('Error updating event problems', { error, guid });

        return false;
    }
};

export const getProblemsByGuid = async ({
    guid,
}: {
    guid: DbEvent['guid'];
}): Promise<EventProblemType[] | null> => {
    try {
        const event = await prisma.event.findUnique({
            where: {
                guid,
            },
            select: {
                problems: true,
            },
        });

        return event?.problems || null;
    } catch (error) {
        log.error('Error getting event problems', { error, guid });

        return null;
    }
};

export const getConferencesFromEvents = async ({
    events,
}: {
    events: {
        conferenceAcronym: DbConference['acronym'];
    }[];
}): Promise<DbConference[]> => {
    try {
        return await prisma.conference.findMany({
            where: {
                acronym: {
                    in: events.map(e => e.conferenceAcronym),
                },
            },
        });
    } catch (error) {
        log.error('Error getting conferences from events', { error });
        return [];
    }
};
