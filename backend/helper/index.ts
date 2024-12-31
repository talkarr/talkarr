// Helpers for fetching data from api.media.ccc.de

import { cccApiBaseUrl } from '@backend/constants';
import apiFetch from '@backend/fetch';
import type { Event } from '@backend/talks';

export const getTalkByGuid = async (guid: string): Promise<Event | null> => {
    const response = await apiFetch(`${cccApiBaseUrl}/events/${guid}`);

    if (!response.ok) {
        return null;
    }

    return response.json() as Event;
};
