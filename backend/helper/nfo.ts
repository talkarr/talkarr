import type { ApiEvent, ExtendedDbEvent } from '@backend/talks';

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
