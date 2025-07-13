import type { RequestBody } from '@backend/types';

import { getCookiesForApi } from '@/app/_api';

import api from '@/utils/api';

export type AddEventBody = RequestBody<'/talks/add'>;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const pAddEvent = async (body: AddEventBody) => {
    const cookie = await getCookiesForApi();

    const { data, error, response } = await api.POST('/talks/add', {
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

export type AddEventResponse =
    | Awaited<ReturnType<typeof pAddEvent>>
    | undefined;

export const addEvent: (body: AddEventBody) => Promise<AddEventResponse> =
    pAddEvent;
