import type { Conference as DbConference } from '@prisma/client';

import mime from 'mime-types';
import fs_promises from 'node:fs/promises';
import pathUtils from 'node:path';
import sharp from 'sharp';

// eslint-disable-next-line import/no-cycle
import { addDownloadedFile, removeFileFromDatabase } from '@backend/events';
import {
    conferenceNfoFilename,
    conferenceThumbFilename,
    defaultMimeType,
    getEventFilename,
    isVideoFile,
} from '@backend/fs';
import rootLog from '@backend/root-log';
import type {
    ApiConference,
    ApiEvent,
    ConvertBigintToNumberType,
    ExtendedDbEvent,
    NormalAndConvertedDate,
} from '@backend/types';

const log = rootLog.child({ label: 'helper/nfo' });

export const generateEventNfo = ({
    event,
}: {
    event: ConvertBigintToNumberType<
        NormalAndConvertedDate<ApiEvent | ExtendedDbEvent>
    >;
}): string => {
    const persons = event.persons.map(person =>
        typeof person === 'string' ? person : person.name,
    );
    const tags = event.tags.map(tag =>
        typeof tag === 'string' ? tag : tag.name,
    );

    const conferenceName =
        'conference_data' in event
            ? event.conference_data?.title
            : 'conference' in event
              ? event.conference.title
              : null;

    const year =
        event.date instanceof Date
            ? event.date.getFullYear()
            : typeof event.date === 'string'
              ? new Date(event.date).getFullYear()
              : null;

    return `
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<episodedetails>
    <title>${event.title}</title>
    <plot>${event.description}</plot>
    ${persons.map(person => `<actor>${person}</actor>`).join('\n')}
    ${tags.map(tag => `<genre>${tag}</genre>`).join('\n')}
    <premiered>${event.date}</premiered>
    ${conferenceName ? `<studio>${conferenceName}</studio>` : ''}
    <id>${event.guid}</id>
    <uniqueid type="url">${event.frontend_link}</uniqueid>
    ${year ? `<year>${year}</year>` : ''}
</episodedetails>
    `.trim();
};

export const generateConferenceNfo = ({
    conference,
}: {
    conference: ConvertBigintToNumberType<
        NormalAndConvertedDate<ApiConference | DbConference>
    >;
}): string =>
    `
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<tvshow>
    <title>${conference.title}</title>
    ${conference.description ? `<plot>${conference.description}</plot>` : ''}
    <studio>${conference.title}</studio>
    <id>${conference.acronym}</id>
</tvshow>
`.trim();

export const handleEventNfoGeneration = async ({
    folder,
    event,
    force,
}: {
    folder: string;
    event: ConvertBigintToNumberType<NormalAndConvertedDate<ExtendedDbEvent>>;
    force?: boolean;
}): Promise<boolean> => {
    const eventNfoPath = pathUtils.join(
        folder,
        getEventFilename({
            event,
            extension: 'nfo',
        }),
    );

    log.info('Generating event NFO file...', { eventNfoPath });

    await fs_promises.mkdir(pathUtils.dirname(eventNfoPath), {
        recursive: true,
    });

    const eventNfoExists = await fs_promises
        .access(eventNfoPath)
        .then(() => true)
        .catch(() => false);

    if (eventNfoExists && !force) {
        log.info('Event NFO file already exists.');

        return true;
    }
    if (eventNfoExists && force) {
        log.info('Event NFO file already exists, but force is set.');

        await fs_promises.unlink(eventNfoPath);

        if (
            !(await removeFileFromDatabase({
                eventGuid: event.guid,
                path: eventNfoPath,
            }))
        ) {
            log.error('Error removing file from database:', {
                title: event.title,
            });

            return false;
        }
    }

    const eventNfoContent = generateEventNfo({ event });

    // write nfo file
    await fs_promises.writeFile(eventNfoPath, eventNfoContent);

    log.info('Event NFO file generated.');

    const eventNfoStats = await fs_promises.stat(eventNfoPath, {
        bigint: true,
    });

    return addDownloadedFile({
        event,
        file: {
            path: eventNfoPath,
            filename: pathUtils.basename(eventNfoPath),
            url: event.frontend_link,
            created: eventNfoStats.birthtime,
            mime: mime.lookup(eventNfoPath) || defaultMimeType,
            bytes: eventNfoStats.size,
            is_video: isVideoFile(eventNfoPath),
        },
        eventInfoGuid: event.eventInfo?.guid,
    });
};

export const handleConferenceMetadataGeneration = async ({
    rootFolderPath,
    conference,
}: {
    rootFolderPath: string;
    conference: ConvertBigintToNumberType<
        NormalAndConvertedDate<ApiConference | DbConference>
    >;
}): Promise<void> => {
    const conferenceNfoPath = pathUtils.join(
        rootFolderPath,
        conference.acronym,
        conferenceNfoFilename,
    );

    const conferencePosterPath = pathUtils.join(
        rootFolderPath,
        conference.acronym,
        conferenceThumbFilename,
    );

    await fs_promises.mkdir(
        pathUtils.join(rootFolderPath, conference.acronym),
        {
            recursive: true,
        },
    );

    const conferenceNfoExists = await fs_promises
        .access(conferenceNfoPath)
        .then(() => true)
        .catch(() => false);

    const conferencePosterExists = await fs_promises
        .access(conferencePosterPath)
        .then(() => true)
        .catch(() => false);

    if (conferenceNfoExists) {
        log.debug('Conference NFO file already exists.');
    } else {
        log.debug('Generating conference NFO file...', {
            conferenceNfoPath,
        });

        const conferenceNfoContent = generateConferenceNfo({ conference });

        // write nfo file
        await fs_promises.writeFile(conferenceNfoPath, conferenceNfoContent);

        log.info('Conference NFO file generated.');
    }

    if (conferencePosterExists) {
        log.debug('Conference poster already exists.');
    } else {
        log.debug('Generating conference poster file...', {
            conferencePosterPath,
        });

        const url = conference.logo_url;

        if (!url) {
            log.error('No conference poster URL found.');

            return;
        }

        const response = await fetch(url);

        if (!response.ok) {
            log.error('Error fetching conference poster:', { url });

            return;
        }

        const buffer = Buffer.from(await response.arrayBuffer());

        const image = sharp(buffer);

        const jpegBuffer = await image.jpeg().toBuffer();

        await fs_promises.writeFile(conferencePosterPath, jpegBuffer);
    }
};
