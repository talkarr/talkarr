import type { RequestParams } from '@backend/types';

import { getCookiesForApi } from '@/app/_api';

import api from '@/utils/api';

export type SearchEventsArgs = RequestParams<'/talks/search'>;

let searchEventsHandle: AbortController | null = null;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const pSearchEvents = async (query: SearchEventsArgs) => {
    const cookie = await getCookiesForApi();

    if (searchEventsHandle) {
        searchEventsHandle.abort();
    }

    const { data, error, response } = await api.GET('/talks/search', {
        params: {
            query,
        },
        headers: {
            cookie,
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
) => Promise<SearchEventsResponse> = pSearchEvents;
