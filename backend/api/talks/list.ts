import type { ExtendedDbEvent } from '@backend/talks';
import { listTalks } from '@backend/talks';
import type {
    ConvertDateToStringType,
    ExpressRequest,
    ExpressResponse,
} from '@backend/types';

const handleListEventsRequest = async (
    _req: ExpressRequest<'/talks/list', 'get'>,
    res: ExpressResponse<'/talks/list', 'get'>,
): Promise<void> => {
    const talks = await listTalks();

    res.json({
        success: true,
        data: talks.map(talk => ({
            ...(talk as unknown as ConvertDateToStringType<ExtendedDbEvent>),
            persons: talk.persons.map(person => person.name),
            tags: talk.tags.map(tag => tag.name),
        })),
    });
};

export default handleListEventsRequest;
