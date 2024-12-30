import { cccApiBaseUrl } from '@backend/constants';
import apiFetch from '@backend/fetch';
import type { ExpressRequest, ExpressResponse } from '@backend/types';

export const handleSearchEventsRequest = async (
    req: ExpressRequest<'/search', 'get'>,
    res: ExpressResponse<'/search', 'get'>,
): Promise<void> => {
    const query = req.query.q;

    if (!query) {
        res.status(400).json({
            success: false,
            error: 'No search query provided.',
        });

        return;
    }

    const params = new URLSearchParams();

    params.append('q', query);

    const results = await apiFetch(
        `${cccApiBaseUrl}/events/search?${params.toString()}`,
    );

    if (!results.ok) {
        res.status(500).json({
            success: false,
            error: 'An error occurred while searching for talks.',
        });

        return;
    }

    const json = await results.json();

    console.log(json);

    res.json({ success: true, data: json });
};
