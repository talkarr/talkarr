import mime from 'mime-types';
import fs_promises from 'node:fs/promises';
import pathUtils from 'path';

import { isVideoFile, nfoFilename } from '@backend/fs';
import rootLog from '@backend/rootLog';
import { addDownloadedFile } from '@backend/talks';
import type {
    ApiEvent,
    ConvertDateToStringType,
    ExtendedDbEvent,
    NormalAndConvertedDate,
} from '@backend/types';

const log = rootLog.child({ label: 'helper/nfo' });

export const generateNfo = (
    data: NormalAndConvertedDate<ApiEvent | ExtendedDbEvent>,
): string => {
    const persons = data.persons.map(person =>
        typeof person === 'string' ? person : person.name,
    );
    const tags = data.tags.map(tag =>
        typeof tag === 'string' ? tag : tag.name,
    );

    return `
    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <movie>
        <title>${data.title}</title>
        <plot>${data.description}</plot>
        ${persons.map(person => `<actor>${person}</actor>`).join('\n')}
        ${tags.map(tag => `<genre>${tag}</genre>`).join('\n')}
        <premiered>${data.date}</premiered>
    </movie>
    `;
};

export const handleNfoGeneration = async (
    folder: string,
    talk: ExtendedDbEvent | ConvertDateToStringType<ExtendedDbEvent>,
): Promise<boolean> => {
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

    const nfoContent = generateNfo(talk);

    // write nfo file
    await fs_promises.writeFile(nfoPath, nfoContent);

    log.info('NFO file generated.');

    const nfoStats = await fs_promises.stat(nfoPath);

    return addDownloadedFile(talk, {
        path: nfoPath,
        filename: pathUtils.basename(nfoPath),
        url: talk.frontend_link,
        created: nfoStats.birthtime,
        mime: mime.lookup(nfoPath) || 'application/octet-stream',
        bytes: nfoStats.size,
        is_video: isVideoFile(nfoPath),
    });
};
