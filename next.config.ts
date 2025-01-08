// noinspection ES6PreferShortImport

import type { NextConfig } from 'next';

import { createRequire } from 'module';

import { apiBaseUrl } from './src/constants';

import { nodeFileTrace } from '@vercel/nft';

const require = createRequire(import.meta.url);

const nextConfig = async (): Promise<NextConfig> => {
    const { fileList: additionalTracedFiles } = await nodeFileTrace([
        // prisma.io
        require.resolve('@prisma/client'),
        require.resolve('prisma'),
        // ts-node
        require.resolve('ts-node'),
    ]);

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
        // TODO: Try to enable standalone when everything else works
        output: 'standalone',
        devIndicators: {
            appIsrStatus: true,
            buildActivity: true,
            buildActivityPosition: 'bottom-right',
        },
        outputFileTracingIncludes: {
            '**': [
                ...additionalTracedFiles,
                './node_modules/.bin/prisma',
                './node_modules/.bin/ts-node',
                // dotenv-cli
                './node_modules/dotenv-cli/bin/cli.js',
                './node_modules/.bin/dotenv',
            ],
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
