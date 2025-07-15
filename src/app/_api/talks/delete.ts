import type { RequestBody } from '@backend/types';

import { getCookiesForApi } from '@/app/_api';

import api from '@/utils/api';

export type DeleteEventBody = RequestBody<'/talks/delete'>;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const pDeleteEvent = async (body: DeleteEventBody) => {
    const cookie = await getCookiesForApi();

    const { data, error, response } = await api.POST('/talks/delete', {
        body,
        headers: {
            cookie,
        },
    });

    if (error) {
        return { ...error, response };
    }

    return data;
};

export type DeleteEventResponse =
    | Awaited<ReturnType<typeof pDeleteEvent>>
    | undefined;

export const deleteEvent: (
    body: DeleteEventBody,
) => Promise<DeleteEventResponse> = pDeleteEvent;
