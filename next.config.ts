// noinspection ES6PreferShortImport

import type { Options } from '@ryoppippi/unplugin-typia';

import type { NextConfig } from 'next';

import { simpleGit } from 'simple-git';

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

const nextConfig = async (): Promise<NextConfig> => {
    const git = simpleGit();

    const currentCommit =
        process.env.OVERRIDE_CURRENT_COMMIT ||
        (await git.revparse(['HEAD'])).trim();

    const currentCommitTimestamp =
        process.env.OVERRIDE_CURRENT_COMMIT_TS ||
        (await git.raw(['show', '-s', '--format=%ct', currentCommit])).trim();

    const currentBranch =
        process.env.OVERRIDE_CURRENT_BRANCH ||
        (await simpleGit().branch()).current;

    const currentTag =
        process.env.OVERRIDE_CURRENT_TAG || (await simpleGit().tags()).latest;

    const currentVersion =
        process.env.OVERRIDE_CURRENT_VERSION ||
        (await simpleGit().raw(['describe', '--tags', '--always'])).trim();

    const isInsideDocker = process.env.IS_INSIDE_DOCKER === 'true';

    console.dir({
        currentCommit,
        currentBranch,
        currentTag,
        currentVersion,
        isInsideDocker,
        currentCommitTimestamp,
    });

    return unTypiaNext(
        {
            /* config options here */
            reactStrictMode: true,
            logging: {
                fetches: {
                    fullUrl: true,
                    hmrRefreshes: true,
                },
            },
            env: {
                API_BASE_URL: apiBaseUrl,
                NEXT_PUBLIC_CURRENT_COMMIT: currentCommit,
                NEXT_PUBLIC_CURRENT_BRANCH: currentBranch,
                NEXT_PUBLIC_CURRENT_TAG: currentTag,
                NEXT_PUBLIC_CURRENT_VERSION: currentVersion,
                NEXT_PUBLIC_IS_INSIDE_DOCKER: isInsideDocker ? 'true' : 'false',
                NEXT_PUBLIC_CURRENT_COMMIT_TIMESTAMP: currentCommitTimestamp,
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
            typescript: {
                ignoreBuildErrors: true,
            },
        },
        unpluginTypiaOptions,
    );
};

export default nextConfig;
