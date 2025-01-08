import fs_promises from 'fs/promises';
import mime from 'mime-types';
import pathUtils from 'path';

import { isVideoFile } from '@backend/fs';
import rootLog from '@backend/rootLog';
import type { ApiEvent, ExtendedDbEvent } from '@backend/talks';
import { addDownloadedFile } from '@backend/talks';

const log = rootLog.child({ label: 'helper/nfo' });

export const generateNfo = (data: ApiEvent | ExtendedDbEvent): string => `
    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <movie>
        <title>${data.title}</title>
        <plot>${data.description}</plot>
        ${data.persons.map(person => `<actor>${person}</actor>`).join('\n')}
        ${data.tags.map(tag => `<genre>${tag}</genre>`).join('\n')}
        <premiered>${data.date}</premiered>
    </movie>
    `;

export const nfoFilename = 'talk.nfo';

export const handleNfoGeneration = async (
    folder: string,
    talk: ExtendedDbEvent,
): Promise<boolean> => {
    log.info('Generating NFO file...');

    const nfoContent = generateNfo(talk);

    const nfoPath = pathUtils.join(folder, nfoFilename);

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
