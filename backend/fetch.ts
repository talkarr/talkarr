import cache from '@backend/cache';
import rootLog from '@backend/root-log';

const log = rootLog.child({ label: 'fetch' });

export interface FetchResponse extends Omit<Response, 'json' | 'text'> {
    json: () => unknown;
}

export const apiCacheTime = 1000 * 60 * 5; // 5 minutes

const apiFetch = async (
    input: RequestInfo | URL,
    init?: RequestInit,
    cacheKey?: string,
    _cacheTime?: number,
    _cacheStoreKeys: string[] = [],
): Promise<FetchResponse> => {
    const cacheTime = _cacheTime || apiCacheTime;
    const cacheStoreKeys = [..._cacheStoreKeys];

    const url =
        typeof input === 'string'
            ? input
            : input instanceof URL
              ? input.href
              : input.toString();

    if (cacheKey) {
        const cachedResponse = cache.get(cacheKey);

        if (cachedResponse) {
            log.debug(`Returning cached response for ${url}`);

            return cachedResponse as FetchResponse;
        }
    }

    log.debug(`Fetching ${url}`);

    const response = await fetch(input, init);

    const json = await response.json();

    const fetchResponse = response as FetchResponse;

    fetchResponse.json = () => json;
    if ('text' in fetchResponse) {
        delete fetchResponse.text;
    }

    if (cacheKey) {
        if (!cacheStoreKeys.includes(cacheKey)) {
            cacheStoreKeys.push(cacheKey);
        }

        log.debug(`Caching response for ${url}`);

        for (const key of cacheStoreKeys) {
            cache.put(key, fetchResponse, cacheTime);
        }
    }

    return fetchResponse;
};

export default apiFetch;
