import type { RequestBody } from '@backend/types';

import api from '@/utils/api';

export type AddEventBody = RequestBody<'/talks/add'>;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const pAddEvent = async (body: AddEventBody) => {
    const { data, error, response } = await api.POST('/talks/add', {
        body,
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
