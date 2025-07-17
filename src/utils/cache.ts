import type { paths } from '@backend/generated/schema';

export const generateCacheUrl = ({
    url,
    cacheKey,
}: {
    url: string;
    cacheKey: string;
}): string => {
    if (url.startsWith('data:')) {
        return url;
    }

    const cacheApiUrl: keyof paths = '/cache/fetch';

    const encodedUrl = encodeURIComponent(url);
    const encodedCacheKey = encodeURIComponent(cacheKey);

    return `/api${cacheApiUrl}?url=${encodedUrl}&key=${encodedCacheKey}`;
};
