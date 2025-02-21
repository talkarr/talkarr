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

const nextConfig = async (): Promise<NextConfig> => {
    const isInsideDocker = process.env.IS_INSIDE_DOCKER === 'true';
    let currentCommit: string | undefined = process.env.OVERRIDE_CURRENT_COMMIT;
    let currentCommitTimestamp: string | undefined =
        process.env.OVERRIDE_CURRENT_COMMIT_TS;
    let currentBranch: string | undefined = process.env.OVERRIDE_CURRENT_BRANCH;
    let currentTag: string | undefined = process.env.OVERRIDE_CURRENT_TAG;
    let currentVersion: string | undefined =
        process.env.OVERRIDE_CURRENT_VERSION;

    if (!isInsideDocker) {
        console.log('Running outside of Docker, fetching git info...');

        const { simpleGit } = await import('simple-git');

        const git = simpleGit();

        if (!currentCommit) {
            currentCommit = (await git.revparse(['HEAD'])).trim();
        }

        if (!currentCommitTimestamp) {
            currentCommitTimestamp = (
                await git.raw(['show', '-s', '--format=%ct', currentCommit])
            ).trim();
        }

        if (!currentBranch) {
            currentBranch = (await git.branch()).current;
        }

        if (!currentTag) {
            currentTag = (await git.tags()).latest;
        }

        if (!currentVersion) {
            currentVersion = (
                await git.raw(['describe', '--tags', '--always'])
            ).trim();
        }
    }

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
                NEXT_PUBLIC_CURRENT_TAG:
                    currentTag === 'false' ? undefined : currentTag,
                NEXT_PUBLIC_CURRENT_VERSION: currentVersion,
                NEXT_PUBLIC_IS_INSIDE_DOCKER: isInsideDocker ? 'true' : 'false',
                NEXT_PUBLIC_CURRENT_COMMIT_TIMESTAMP: currentCommitTimestamp,
                YTDLP_PATH_OVERRIDE: process.env.YTDLP_PATH_OVERRIDE,
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
                minimumCacheTTL: 24 * 60 * 60, // 24 hours
            },
            /*
            // for some reason, this does not work :(
            async headers() {
                return [
                    {
                        source: '/_next/image',
                        has: [
                            {
                                type: 'query',
                                key: 'url',
                                value: '(?<static>.*static\\.media\\.ccc\\.de.*)',
                            },
                        ],
                        headers: [
                            {
                                // set cache control to 30d
                                key: 'Cache-Control',
                                value: 'public, max-age=2592000',
                            },
                        ],
                    },
                ];
            },
            */
            eslint: {
                ignoreDuringBuilds: true,
            },
            typescript: {
                ignoreBuildErrors: true,
            },
        } as NextConfig,
        unpluginTypiaOptions,
    );
};

export default nextConfig;
