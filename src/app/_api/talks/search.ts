import type { RequestParams } from '@backend/types';

import api, { wrapApiCall } from '@/utils/api';

export type SearchEventsArgs = RequestParams<'/talks/search'>;

let searchEventsHandle: AbortController | null = null;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const pSearchEvents = async (query: SearchEventsArgs) => {
    if (searchEventsHandle) {
        searchEventsHandle.abort('new request initiated');
    }

    const { data, error, response } = await api.GET('/talks/search', {
        params: {
            query,
        },
        signal: (searchEventsHandle = new AbortController()).signal,
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
) => Promise<SearchEventsResponse> = wrapApiCall(pSearchEvents);
