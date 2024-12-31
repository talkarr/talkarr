import type { NextConfig } from 'next';

import { apiBaseUrl } from './src/constants';

const nextConfig: NextConfig = {
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
    output: 'standalone',
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

export default nextConfig;
