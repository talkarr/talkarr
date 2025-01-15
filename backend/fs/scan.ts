import type { File } from '@prisma/client';

import fs_promises from 'fs/promises';
import mime from 'mime-types';
import pathUtils from 'path';

import type { ExistingFile } from '@backend/fs/index';
import { isVideoFile, validFileExtensions } from '@backend/fs/index';
import {
    getConferenceFromAcronym,
    getTalkFromApiBySlug,
} from '@backend/helper';
import rootLog from '@backend/rootLog';
import { getEventByFilePath } from '@backend/talks';
import type { ApiConference, ApiEvent } from '@backend/types';

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

export const scanForExistingFiles = async (
    rootFolderPath: string,
): Promise<ExistingFileWithGuessedInformation[] | null> => {
    const existingFiles: ExistingFileWithGuessedInformation[] = [];

    // folder structure is <rootFolderPath>/<conference_acronym>/<event_slug>

    const folders = (
        await fs_promises.readdir(rootFolderPath, { withFileTypes: true })
    ).filter(dirent => dirent.isDirectory());

    for await (const folder of folders) {
        const conferenceAcronym = folder.name;
        let conferenceIsValid = true;

        const conference = await getConferenceFromAcronym(conferenceAcronym);

        if (!conference) {
            log.warn(`Folder ${conferenceAcronym} is not a valid conference`);
            conferenceIsValid = false;
            // continue; // we will proceed the files so that the user can manually correct this
        }

        log.info(`Scanning ${conferenceAcronym}...`);

        const events = (
            await fs_promises.readdir(
                pathUtils.join(rootFolderPath, conferenceAcronym),
                { withFileTypes: true },
            )
        ).filter(dirent => dirent.isDirectory());

        for await (const eventDir of events) {
            const eventSlug = eventDir.name;
            let eventIsValid = true;

            const eventPath = pathUtils.join(
                rootFolderPath,
                folder.name,
                eventDir.name,
            );

            const eventFromDbByFile = await getEventByFilePath(eventPath);

            if (eventFromDbByFile) {
                log.info(
                    `File does already exist in database, this is not a new file`,
                    { eventPath },
                );
                continue;
            }

            const event = await getTalkFromApiBySlug(eventSlug);

            if (!event) {
                log.warn(`Event ${eventSlug} does not exist`);
                eventIsValid = false;
                // continue; // we will proceed the files so that the user can manually correct this
            }

            const files = (
                await fs_promises.readdir(eventPath, { withFileTypes: true })
            ).filter(
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

                const fileStats = await fs_promises.stat(filePath);

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
                    created_at: fileStats.birthtime,
                    path: filePath,
                    mime: mime.lookup(file.name) || 'application/octet-stream',
                    isVideo: isVideoFile(filePath),
                    filename: file.name,
                });
            }
        }
    }

    return existingFiles;
};
