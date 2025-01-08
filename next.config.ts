// noinspection ES6PreferShortImport

import type { NextConfig } from 'next';

import { createRequire } from 'module';

import { apiBaseUrl } from './src/constants';

import { nodeFileTrace } from '@vercel/nft';

const require = createRequire(import.meta.url);

const cache = Object.create(null);

const nextConfig = async (): Promise<NextConfig> => {
    // check if command is "next build"
    if (process.argv.includes('build')) {
        if (process.env.NODE_ENV !== 'production') {
            throw new Error(
                'You must build in production mode. Set NODE_ENV=production.',
            );
        }
    }

    console.log(
        'Fetching dependencies missing (thx nextjs standalone mode + custom server :))',
    );
    const packageJson = require('./package.json');

    const dependencies = Object.keys(packageJson.dependencies);

    const unresolvedDependencies: string[] = [];

    const { fileList } = await nodeFileTrace(
        [
            /*
        // prisma.io
        require.resolve('@prisma/client'),
        require.resolve('prisma'),
        // dotenv-cli
        require.resolve('cross-spawn'),
        require.resolve('dotenv'),
        require.resolve('dotenv-expand'),
        require.resolve('minimist'),
        // ts-node
        require.resolve('ts-node'),
        // typescript
        require.resolve('typescript'),
        // tsconfig-paths/register
        require.resolve('tsconfig-paths/register'), */
            // add require.resolve for each of your dependencies
            ...(dependencies
                .map(dep => {
                    try {
                        return require.resolve(dep);
                    } catch {
                        console.log('Problem with dependency:', dep);
                        unresolvedDependencies.push(`./node_modules/${dep}/**`);
                        return false;
                    }
                })
                .filter(Boolean) as string[]),
        ],
        {
            base: process.cwd(),
            log: false,
            cache,
        },
    );

    const additionalTracedFiles = [
        ...fileList,
        './node_modules/.bin/prisma',
        // ts-node
        './node_modules/ts-node/**',
        // dotenv-cli
        './node_modules/dotenv-cli/**',
        // @types/*
        './node_modules/@types/**',
        // .bin
        './node_modules/.bin/**',
        // add unresolved dependencies
        ...unresolvedDependencies,
    ];

    console.log('Tracing additional files:', additionalTracedFiles.length);

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
        outputFileTracingIncludes:
            process.env.NODE_ENV === 'production'
                ? {
                      '**': additionalTracedFiles,
                  }
                : {},
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
