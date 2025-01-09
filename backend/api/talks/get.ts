import { getTalkFromApiByGuid } from '@backend/helper';
import rootLog from '@backend/rootLog';
import {
    getSpecificTalkByGuid,
    getSpecificTalkBySlug,
    getTalkInfoByGuid,
} from '@backend/talks';
import type {
    ConvertDateToStringType,
    ExpressRequest,
    ExpressResponse,
    ExtendedDbEvent,
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

    const talkData = await getTalkFromApiByGuid(event.guid, {
        cacheKey: `talks/get/${event.guid}`,
    });

    const talkInfo = await getTalkInfoByGuid(event.guid);

    if (!talkData || !talkInfo) {
        log.error('Talk not found in API.', {
            guid: event.guid,
            isTalkDataNull: talkData === null,
            isTalkInfoNull: talkInfo === null,
        });

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
            info: talkInfo,
        },
    });
};

export default handleGetEventRequest;
