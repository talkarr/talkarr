'use server';

import { cookies } from 'next/headers';

import api from '@/utils/api';

export async function getCookiesForApi(): Promise<string> {
    const cookieStore = await cookies();

    return cookieStore.toString();
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const pGetAppStatus = async () => {
    const { data, error, response } = await api.GET('/status');

    if (error) {
        return { ...error, response };
    }

    return data;
};

export type GetAppStatusResponse =
    | Awaited<ReturnType<typeof pGetAppStatus>>
    | undefined;

export const getAppStatus: () => Promise<GetAppStatusResponse> = pGetAppStatus;
