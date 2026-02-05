import type { Event as DbEvent } from '@prisma-generated/client';

import { simpleListTalks } from '@backend/events';
import type {
    ConvertDateToStringType,
    ExpressRequest,
    ExpressResponse,
} from '@backend/types';

const handleBasicListEventsRequest = async (
    _req: ExpressRequest<'/talks/basic-list', 'get'>,
    res: ExpressResponse<'/talks/basic-list', 'get'>,
): Promise<void> => {
    const events = await simpleListTalks();

    res.json({
        success: true,
        data: events.map(event => ({
            ...(event as unknown as ConvertDateToStringType<DbEvent>),
            duration: Number(event.duration),
            duration_str: event.duration.toString(),
        })),
    });
};

export default handleBasicListEventsRequest;
