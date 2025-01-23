import mime from 'mime-types';
import fs_promises from 'node:fs/promises';
import pathUtils from 'path';

import { addDownloadedFile } from '@backend/events';
import { defaultMimeType, isVideoFile, nfoFilename } from '@backend/fs';
import rootLog from '@backend/rootLog';
import type {
    ApiEvent,
    ConvertDateToStringType,
    ExtendedDbEvent,
    NormalAndConvertedDate,
} from '@backend/types';

const log = rootLog.child({ label: 'helper/nfo' });

export const generateNfo = ({
    event,
}: {
    event: NormalAndConvertedDate<ApiEvent | ExtendedDbEvent>;
}): string => {
    const persons = event.persons.map(person =>
        typeof person === 'string' ? person : person.name,
    );
    const tags = event.tags.map(tag =>
        typeof tag === 'string' ? tag : tag.name,
    );

    return `
    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <movie>
        <title>${event.title}</title>
        <plot>${event.description}</plot>
        ${persons.map(person => `<actor>${person}</actor>`).join('\n')}
        ${tags.map(tag => `<genre>${tag}</genre>`).join('\n')}
        <premiered>${event.date}</premiered>
    </movie>
    `;
};

export const handleNfoGeneration = async ({
    folder,
    event,
}: {
    folder: string;
    event: ExtendedDbEvent | ConvertDateToStringType<ExtendedDbEvent>;
}): Promise<boolean> => {
    log.info('Generating NFO file...');

    const nfoPath = pathUtils.join(folder, nfoFilename);

    const nfoExists = await fs_promises
        .access(nfoPath)
        .then(() => true)
        .catch(() => false);

    if (nfoExists) {
        log.info('NFO file already exists.');

        return true;
    }

    const nfoContent = generateNfo({ event });

    // write nfo file
    await fs_promises.writeFile(nfoPath, nfoContent);

    log.info('NFO file generated.');

    const nfoStats = await fs_promises.stat(nfoPath);

    return addDownloadedFile({
        event,
        file: {
            path: nfoPath,
            filename: pathUtils.basename(nfoPath),
            url: event.frontend_link,
            created: nfoStats.birthtime,
            mime: mime.lookup(nfoPath) || defaultMimeType,
            bytes: nfoStats.size,
            is_video: isVideoFile(nfoPath),
        },
    });
};
