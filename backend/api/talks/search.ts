import { cccApiBaseUrl, conferenceCacheKey } from '@backend/constants';
import apiFetch from '@backend/fetch';
import type { components } from '@backend/generated/schema';
import rootLog from '@backend/rootLog';
import type {
    ExpressRequest,
    ExpressResponse,
    SuccessData,
} from '@backend/types';

const log = rootLog.child({ label: 'search' });

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
        log.error(
            `Failed to fetch search results for query "${query}": ${results.status}`,
        );

        res.status(500).json({
            success: false,
            error: 'An error occurred while searching for talks.',
        });

        return;
    }

    const json = results.json() as SuccessData<'/search', 'get'>;

    const uniqueConferenceUrls = new Set<string>();

    const conferences = new Map<string, components['schemas']['Conference']>();

    json.events.forEach((event: components['schemas']['Event']) => {
        if (event.conference_url) {
            uniqueConferenceUrls.add(event.conference_url);
        }
    });

    const fetchPromises = [];

    for (const url of uniqueConferenceUrls) {
        fetchPromises.push(
            apiFetch(url, undefined, `${conferenceCacheKey}-${url}`).then(
                async conference => {
                    if (conference.ok) {
                        const conferenceJson =
                            conference.json() as components['schemas']['Conference'];

                        conferences.set(url, conferenceJson);
                    } else {
                        log.warn(
                            `Failed to fetch conference data for ${url}: ${conference.status}`,
                        );
                    }
                },
            ),
        );
    }

    await Promise.all(fetchPromises);

    const data: SuccessData<'/search', 'get'> = {
        events: json.events.map(event => {
            const conference = conferences.get(event.conference_url);

            if (conference && 'events' in conference) {
                delete conference.events;
            }

            return {
                ...event,
                conference_data: conference,
            };
        }),
    };

    res.json({ success: true, data });
};
