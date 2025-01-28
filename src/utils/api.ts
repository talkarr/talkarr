import type { Middleware } from 'openapi-fetch';

import createClient from 'openapi-fetch';

import type { paths } from '@backend/generated/schema';

const tag = `API-${typeof window === 'undefined' ? 'SERVER-SIDE' : 'CLIENT-SIDE'}`;

const apiMiddleware: Middleware = {
    onRequest: async ({ request }) => {
        // get token from cookie "token"
        if (process.env.CI || process.env.NODE_ENV !== 'production') {
            console.log(
                `[${tag}] Fetching ${request.method} ${request.url} with cookies "${request.headers.get('cookie')}"`,
            );
        }
        // @ts-expect-error: requestTime is not part of the Node.js Request type
        request.requestTime = Date.now();
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

api.use(apiMiddleware);

export default api;
