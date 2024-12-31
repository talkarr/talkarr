import cache from '@backend/cache';
import rootLog from '@backend/rootLog';

const log = rootLog.child({ label: 'fetch' });

export interface FetchResponse extends Omit<Response, 'json' | 'text'> {
    json: () => unknown;
}

export const apiCacheTime = 1000 * 60 * 5; // 5 minutes

const apiFetch = async (
    input: RequestInfo | URL,
    init?: RequestInit,
    cacheKey?: string,
    cacheTime: number = apiCacheTime,
): Promise<FetchResponse> => {
    const url =
        typeof input === 'string'
            ? input
            : input instanceof URL
              ? input.href
              : input.toString();

    log.info(`Fetching ${url}`);

    if (cacheKey) {
        const cachedResponse = cache.get(cacheKey);

        if (cachedResponse) {
            log.info(`Returning cached response for ${url}`);

            return Promise.resolve(cachedResponse as FetchResponse);
        }
    }

    const response = await fetch(input, init);

    const json = await response.json();

    const fetchResponse = response as FetchResponse;

    fetchResponse.json = () => json;
    if ('text' in fetchResponse) {
        delete fetchResponse.text;
    }

    if (cacheKey) {
        log.info(`Caching response for ${url}`);

        cache.put(cacheKey, fetchResponse, cacheTime);
    }

    return fetchResponse;
};

export default apiFetch;
