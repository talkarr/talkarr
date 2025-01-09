// Helpers for fetching data from api.media.ccc.de

import type { Conference } from '@prisma/client';

import { cccApiBaseUrl } from '@backend/constants';
import apiFetch from '@backend/fetch';
import type { ApiEvent } from '@backend/types';

export const getTalkFromApiByGuid = async (
    guid: string,
    cache?: {
        cacheKey?: string;
        cacheDuration?: number;
    },
): Promise<ApiEvent | null> => {
    const response = await apiFetch(
        `${cccApiBaseUrl}/events/${guid}`,
        undefined,
        cache?.cacheKey,
        cache?.cacheDuration,
    );

    if (!response.ok) {
        return null;
    }

    return response.json() as ApiEvent;
};

export const getConferenceFromEvent = async (
    event: ApiEvent | Pick<ApiEvent, 'conference_url'>,
): Promise<Conference | null> => {
    if (!event.conference_url) {
        return null;
    }

    const response = await apiFetch(event.conference_url);

    if (!response.ok) {
        return null;
    }

    return response.json() as Conference;
};
