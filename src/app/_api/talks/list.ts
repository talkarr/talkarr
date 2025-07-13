import { getCookiesForApi } from '@/app/_api';

import api from '@/utils/api';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const pListEvents = async () => {
    const cookie = await getCookiesForApi();
    const { data, error, response } = await api.GET('/talks/list', {
        headers: {
            cookie,
        },
        cache: 'no-store',
    });

    if (error) {
        return { ...error, response };
    }

    return data;
};

export type ListEventsResponse =
    | Awaited<ReturnType<typeof pListEvents>>
    | undefined;

export const listEvents: () => Promise<ListEventsResponse> = pListEvents;
