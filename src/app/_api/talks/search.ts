import api from '@/utils/api';

import type { RequestParams } from '@backend/types';

export type SearchEventsArgs = RequestParams<'/talks/search'>;

let searchEventsHandle: AbortController | null = null;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const pSearchEvents = async (query: SearchEventsArgs) => {
    try {
        if (searchEventsHandle) {
            searchEventsHandle.abort();
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
    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            return undefined;
        }

        throw error;
    }
};

export type SearchEventsResponse =
    | Awaited<ReturnType<typeof pSearchEvents>>
    | undefined;

export const searchEvents: (
    query: SearchEventsArgs,
) => Promise<SearchEventsResponse> = pSearchEvents;
