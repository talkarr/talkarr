import api from '@/utils/api';

import type { RequestParams } from '@backend/types';

export type SearchEventsArgs = RequestParams<'/talks/search'>;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const pSearchEvents = async (query: SearchEventsArgs) => {
    const { data, error, response } = await api.GET('/talks/search', {
        params: {
            query,
        },
    });

    if (error) {
        return { ...error, response };
    }

    return data;
};

export type SearchEventsResponse =
    | Awaited<ReturnType<typeof pSearchEvents>>
    | undefined;

export const searchEvents: (
    query: SearchEventsArgs,
) => Promise<SearchEventsResponse> = pSearchEvents;
