import type { Middleware } from 'openapi-fetch';

import createClient from 'openapi-fetch';

import type { paths } from '@backend/generated/schema';

import { getCookiesForApi } from '@/app/_api';

const tag = `API-${typeof window === 'undefined' ? 'SERVER-SIDE' : 'CLIENT-SIDE'}`;

const apiMiddleware: Middleware = {
    onRequest: async ({ request }) => {
        // get token from cookie "token"
        if (process.env.CI) {
            console.log(
                `[${tag}] Fetching ${request.method} ${request.url} with cookies "${request.headers.get('cookie')}"`,
            );
        }
        // @ts-expect-error: requestTime is not part of the Node.js Request type
        request.requestTime = Date.now();

        const hasCookie = request.headers.has('cookie');
        if (!hasCookie && typeof window === 'undefined') {
            const cookies = await getCookiesForApi();
            if (cookies) {
                request.headers.set('cookie', cookies);
            }
        }
    },
    onResponse: async ({ request, response }) => {
        // @ts-expect-error: requestTime is not part of the Node.js Request type
        const time = Date.now() - request.requestTime;

        console.log(
            `[${tag}] [${request.method}] ${request.url} => ${response.status} ${response.statusText} (${time}ms)`,
        );
    },
    onError: async ({ error, request }) => {
        // @ts-expect-error: requestTime is not part of the Node.js Request type
        const time = Date.now() - request.requestTime;

        if (error instanceof DOMException && error.name === 'AbortError') {
            return;
        }

        console.warn(
            `[${tag}] Error fetching ${request.url}: ${error && typeof error === 'object' && 'message' in error ? error.message : 'Unknown error'} (${time}ms)`,
        );
    },
};

const api =
    typeof window === 'undefined'
        ? createClient<paths>({
              baseUrl: `${process.env.API_BASE_URL}/api`,
          })
        : createClient<paths>({
              baseUrl: '/api',
          });

export const wrapApiCall =
    <T extends (...args: any[]) => Promise<any>>(
        fn: T,
    ): ((...args: Parameters<T>) => Promise<ReturnType<T> | undefined>) =>
    async (...args: Parameters<T>): Promise<ReturnType<T> | undefined> => {
        try {
            return await fn(...args);
        } catch (error) {
            console.error(`[${tag}] Error in API call:`, error);
            return {
                success: false,
                message:
                    error && typeof error === 'object' && 'message' in error
                        ? error.message
                        : 'Unknown error',
                isFromTryCatch: true,
            } as ReturnType<T>;
        }
    };

api.use(apiMiddleware);

export default api;
