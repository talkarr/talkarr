import type { Conference as DbConference } from '@prisma/client';

import mime from 'mime-types';
import fs_promises from 'node:fs/promises';
import pathUtils from 'path';

// eslint-disable-next-line import/no-cycle
import { addDownloadedFile } from '@backend/events';
import {
    conferenceNfoFilename,
    conferenceThumbFilename,
    defaultMimeType,
    eventNfoFilename,
    isVideoFile,
} from '@backend/fs';
import rootLog from '@backend/rootLog';
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

    return `
    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <movie>
        <title>${event.title}</title>
        <plot>${event.description}</plot>
        ${persons.map(person => `<actor>${person}</actor>`).join('\n')}
        ${tags.map(tag => `<genre>${tag}</genre>`).join('\n')}
        <premiered>${event.date}</premiered>
        ${conferenceName ? `<studio>${conferenceName}</studio>` : ''}
    </movie>
    `;
};

export const generateConferenceNfo = ({
    conference,
}: {
    conference: ConvertBigintToNumberType<
        NormalAndConvertedDate<ApiConference | DbConference>
    >;
}): string => `
    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <movie>
        <title>${conference.title}</title>
        ${conference.description ? `<plot>${conference.description}</plot>` : ''}
        <studio>${conference.title}</studio>
    </movie>
    `;

export const handleEventNfoGeneration = async ({
    folder,
    event,
}: {
    folder: string;
    event: ConvertBigintToNumberType<NormalAndConvertedDate<ExtendedDbEvent>>;
}): Promise<boolean> => {
    log.info('Generating event NFO file...');

    const eventNfoPath = pathUtils.join(folder, eventNfoFilename);

    const eventNfoExists = await fs_promises
        .access(eventNfoPath)
        .then(() => true)
        .catch(() => false);

    if (eventNfoExists) {
        log.info('Event NFO file already exists.');

        return true;
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
    log.info('Generating conference NFO file...');

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

    const conferenceNfoExists = await fs_promises
        .access(conferenceNfoPath)
        .then(() => true)
        .catch(() => false);

    const conferencePosterExists = await fs_promises
        .access(conferencePosterPath)
        .then(() => true)
        .catch(() => false);

    if (conferenceNfoExists) {
        log.info('Conference NFO file already exists.');
    } else {
        const conferenceNfoContent = generateConferenceNfo({ conference });

        // write nfo file
        await fs_promises.writeFile(conferenceNfoPath, conferenceNfoContent);

        log.info('Conference NFO file generated.');
    }

    if (conferencePosterExists) {
        log.info('Conference poster already exists.');
    } else {
        log.info('Generating conference poster...');

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

        const buffer = await response.arrayBuffer();

        await fs_promises.writeFile(conferencePosterPath, Buffer.from(buffer));
    }
};
