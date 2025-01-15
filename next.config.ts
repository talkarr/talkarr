// noinspection ES6PreferShortImport

import type { Options } from '@ryoppippi/unplugin-typia';

import type { NextConfig } from 'next';

import { apiBaseUrl } from './src/constants';

import unTypiaNext from '@ryoppippi/unplugin-typia/next';

if (process.argv.includes('build')) {
    if (process.env.NODE_ENV !== 'production') {
        throw new Error(
            'You must build in production mode. Set NODE_ENV=production.',
        );
    }
}

if (!['development', 'production', 'test'].includes(process.env.NODE_ENV)) {
    throw new Error('Invalid NODE_ENV');
}

console.log(`====================
NODE_ENV: ${process.env.NODE_ENV}
====================`);

export const unpluginTypiaOptions: Options = {
    log: process.env.NODE_ENV === 'development',
    cache: process.env.NODE_ENV === 'production',
};

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
    devIndicators: {
        appIsrStatus: true,
        buildActivity: true,
        buildActivityPosition: 'bottom-right',
    },
    compiler: {
        ...(process.env.NODE_ENV === 'production'
            ? {
                  removeConsole: {
                      exclude: ['dir'],
                  },
                  // or else playwright will break
                  reactRemoveProperties: false,
              }
            : {}),
    },
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
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default unTypiaNext(nextConfig, unpluginTypiaOptions);
