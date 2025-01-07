import { getTalkFromApiByGuid } from '@backend/helper';
import rootLog from '@backend/rootLog';
import type { ExtendedDbEvent } from '@backend/talks';
import { getSpecificTalkByGuid, getSpecificTalkBySlug } from '@backend/talks';
import type {
    ConvertDateToStringType,
    ExpressRequest,
    ExpressResponse,
} from '@backend/types';

const log = rootLog.child({ label: 'talks/get' });

const handleGetEventRequest = async (
    req: ExpressRequest<'/talks/get', 'get'>,
    res: ExpressResponse<'/talks/get', 'get'>,
): Promise<void> => {
    const { guid, slug } = req.query;

    if (!guid && !slug) {
        log.error('guid or slug is required.');

        res.status(400).json({
            success: false,
            error: 'guid or slug is required.',
        });

        return;
    }

    let event: ExtendedDbEvent | null = null;

    if (guid) {
        event = await getSpecificTalkByGuid(guid);
    } else if (slug) {
        event = await getSpecificTalkBySlug(slug);
    }

    if (!event) {
        log.error('Talk not found.');

        res.status(404).json({
            success: false,
            error: 'Talk not found.',
        });

        return;
    }

    const talkData = await getTalkFromApiByGuid(event.guid, 'talks/get');

    if (!talkData) {
        log.error('Talk not found in API.');

        res.status(404).json({
            success: false,
            error: 'Talk not found in API.',
        });

        return;
    }

    res.json({
        success: true,
        data: {
            db: {
                ...(event as unknown as ConvertDateToStringType<ExtendedDbEvent>),
                persons: event.persons.map(person => person.name),
                tags: event.tags.map(tag => tag.name),
            },
            talk: talkData,
        },
    });
};

export default handleGetEventRequest;
