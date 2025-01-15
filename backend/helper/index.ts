// Helpers for fetching data from api.media.ccc.de

import { cccApiBaseUrl, conferenceCacheKey } from '@backend/constants';
import apiFetch from '@backend/fetch';
import type { ApiConference, ApiEvent } from '@backend/types';

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
): Promise<ApiConference | null> => {
    if (!event.conference_url) {
        return null;
    }

    const response = await apiFetch(event.conference_url);

    if (!response.ok) {
        return null;
    }

    return response.json() as ApiConference;
};

export const getConferenceFromAcronym = async (
    acronym: string,
): Promise<ApiConference | null> => {
    const response = await apiFetch(
        `${cccApiBaseUrl}/conferences/${acronym}`,
        undefined,
        `${conferenceCacheKey}-${acronym}`,
    );

    if (!response.ok) {
        return null;
    }

    try {
        return response.json() as ApiConference;
    } catch {
        return null;
    }
};

export const getTalkFromApiBySlug = async (
    slug: string,
    cache?: {
        cacheKey?: string;
        cacheDuration?: number;
    },
): Promise<ApiEvent | null> => {
    const response = await apiFetch(
        `${cccApiBaseUrl}/events/${slug}`,
        undefined,
        cache?.cacheKey || `talk-${slug}`,
        cache?.cacheDuration,
    );

    if (!response.ok) {
        return null;
    }

    return response.json() as ApiEvent;
};
