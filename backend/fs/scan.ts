import type { File } from '@prisma/client';

import mime from 'mime-types';
import fs_promises from 'node:fs/promises';
import pathUtils from 'node:path';

import { getEventByFilePath } from '@backend/events';
import {
    defaultMimeType,
    isVideoFile,
    validFileExtensions,
    videoFolder,
} from '@backend/fs';
import type { ExistingFile } from '@backend/fs/index';
import {
    getConferenceFromAcronym,
    getTalkFromApiBySlug,
} from '@backend/helper';
import rootLog from '@backend/root-log';
import type {
    ApiConference,
    ApiEvent,
    ConvertDateToStringType,
} from '@backend/types';

const log = rootLog.child({ label: 'fs/scan' });

export interface ExistingFileWithGuessedInformation
    extends ExistingFile,
        Pick<File, 'filename'> {
    guess: {
        conferenceAcronym: string | null;
        conference: ApiConference | null;
        slug: string | null;
        event: (Omit<ApiEvent, 'recordings'> & { recordings: never }) | null;
        confidence?: number;
    };
}

export const scanForExistingFiles = async ({
    rootFolderPath,
}: {
    rootFolderPath: string;
}): Promise<
    ConvertDateToStringType<ExistingFileWithGuessedInformation>[] | null
> => {
    const existingFiles: ConvertDateToStringType<ExistingFileWithGuessedInformation>[] =
        [];

    // folder structure is <rootFolderPath>/<conference_acronym>/<event_slug>

    const folders = (
        await fs_promises.readdir(rootFolderPath, { withFileTypes: true })
    )
        // eslint-disable-next-line unicorn/no-await-expression-member
        .filter(dirent => dirent.isDirectory());

    for await (const folder of folders) {
        const conferenceAcronym = folder.name;
        let conferenceIsValid = true;

        let conference;

        try {
            conference = await getConferenceFromAcronym({
                acronym: conferenceAcronym,
            });
        } catch (error) {
            log.error(
                `Error fetching conference ${conferenceAcronym}, skipping...`,
                {
                    error,
                },
            );
            // there was a problem during the fetch which is not a 404 for example, so we skip it.
            continue;
        }

        if (!conference) {
            log.warn(`Folder ${conferenceAcronym} is not a valid conference`);
            conferenceIsValid = false;
            // continue; // we will proceed the files so that the user can manually correct this
        }

        const scanPath = pathUtils.join(
            rootFolderPath,
            conferenceAcronym,
            videoFolder,
        );

        const scanPathExists = await fs_promises
            .access(scanPath)
            .then(() => true)
            .catch(() => false);

        if (!scanPathExists) {
            log.warn(`Folder ${scanPath} does not exist`);
            continue;
        }

        log.info(`Scanning ${conferenceAcronym}...`);

        const events = (
            await fs_promises.readdir(scanPath, { withFileTypes: true })
        )
            // eslint-disable-next-line unicorn/no-await-expression-member
            .filter(dirent => dirent.isDirectory());

        for await (const eventDir of events) {
            const eventSlug = eventDir.name;
            let eventIsValid = true;

            const eventPath = pathUtils.join(
                rootFolderPath,
                conferenceAcronym,
                videoFolder,
                eventSlug,
            );

            const eventFromDbByFile = await getEventByFilePath({
                filePath: eventPath,
            });

            if (eventFromDbByFile) {
                log.info(
                    `File does already exist in database, this is not a new file`,
                    { eventPath },
                );
                continue;
            }

            let event;

            try {
                event = await getTalkFromApiBySlug({ slug: eventSlug });
            } catch (error) {
                log.error(`Error fetching event ${eventSlug}, skipping...`, {
                    error,
                });
                continue;
            }

            if (!event) {
                log.warn(`Event ${eventSlug} does not exist`);
                eventIsValid = false;
                // continue; // we will proceed the files so that the user can manually correct this
            }

            const files = (
                await fs_promises.readdir(eventPath, { withFileTypes: true })
            )
                // eslint-disable-next-line unicorn/no-await-expression-member
                .filter(
                    dirent =>
                        dirent.isFile() &&
                        validFileExtensions.includes(
                            pathUtils.extname(dirent.name),
                        ),
                );

            if (files.length === 0) {
                log.warn(`No files found for event ${eventSlug}`);
                continue;
            }

            for await (const file of files) {
                const filePath = pathUtils.join(eventPath, file.name);

                const fileStats = await fs_promises.stat(filePath, {
                    bigint: true,
                });

                const guessWithoutConfidence: Omit<
                    ExistingFileWithGuessedInformation['guess'],
                    'confidence'
                > = {
                    conferenceAcronym: conferenceIsValid
                        ? conferenceAcronym
                        : null,
                    conference:
                        conferenceIsValid && conference
                            ? {
                                  acronym: conference.acronym,
                                  aspect_ratio: conference.aspect_ratio,
                                  updated_at: conference.updated_at,
                                  title: conference.title,
                                  schedule_url: conference.schedule_url,
                                  slug: conference.slug,
                                  event_last_released_at:
                                      conference.event_last_released_at,
                                  link: conference.link,
                                  description: conference.description,
                                  webgen_location: conference.webgen_location,
                                  logo_url: conference.logo_url,
                                  images_url: conference.images_url,
                                  recordings_url: conference.recordings_url,
                                  url: conference.url,
                              }
                            : null,
                    slug: eventIsValid ? eventSlug : null,
                    event: eventIsValid
                        ? ({ ...event, recordings: undefined as never } as Omit<
                              ApiEvent,
                              'recordings'
                          > & { recordings: never })
                        : null,
                };

                // confidence is between 0 and 100. The more fields are not null, the higher the confidence
                const count = Object.values(guessWithoutConfidence).filter(
                    v => v !== null,
                ).length;

                const total = Object.keys(guessWithoutConfidence).length;

                const confidence = (count / total) * 100;

                existingFiles.push({
                    guess: {
                        ...guessWithoutConfidence,
                        confidence: Math.round(confidence),
                    },
                    size: fileStats.size,
                    size_str: fileStats.size.toString(),
                    createdAt: fileStats.birthtime.toISOString(),
                    path: filePath,
                    mime: mime.lookup(file.name) || defaultMimeType,
                    isVideo: isVideoFile(filePath),
                    filename: file.name,
                });
            }
        }
    }

    return existingFiles;
};
