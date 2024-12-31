// Helpers for fetching data from api.media.ccc.de

import { cccApiBaseUrl } from '@backend/constants';
import apiFetch from '@backend/fetch';
import type { ApiEvent } from '@backend/talks';
import type { Conference } from '@prisma/client';

export const getTalkByGuid = async (guid: string): Promise<ApiEvent | null> => {
    const response = await apiFetch(`${cccApiBaseUrl}/events/${guid}`);

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
