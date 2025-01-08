// noinspection ES6PreferShortImport

import type { NextConfig } from 'next';

import { apiBaseUrl } from './src/constants';

const nextConfig = async (): Promise<NextConfig> => {
    // check if command is "next build"
    if (process.argv.includes('build')) {
        if (process.env.NODE_ENV !== 'production') {
            throw new Error(
                'You must build in production mode. Set NODE_ENV=production.',
            );
        }
    }

    return {
        /* config options here */
        reactStrictMode: true,
        logging: {
            fetches: {
                fullUrl: true,
            },
        },
        env: {
            API_BASE_URL: apiBaseUrl,
        },
        devIndicators: {
            appIsrStatus: true,
            buildActivity: true,
            buildActivityPosition: 'bottom-right',
        },
        compiler:
            process.env.NODE_ENV === 'production'
                ? {
                      removeConsole: {
                          exclude: ['dir'],
                      },
                      reactRemoveProperties: true,
                  }
                : {},
        async rewrites() {
            return [
                {
                    source: '/api/:path*',
                    destination: `${apiBaseUrl}/:path*`,
                },
            ];
        },
        images: {
            remotePatterns: [
                {
                    protocol: 'https',
                    hostname: 'static.media.ccc.de',
                    port: '',
                    search: '',
                },
            ],
        },
    };
};

export default nextConfig;
