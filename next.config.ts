/* eslint-disable unicorn/no-await-expression-member */
// noinspection ES6PreferShortImport

import type { Options } from '@ryoppippi/unplugin-typia';

import type { NextConfig } from 'next';

import { apiBaseUrl } from './src/constants';

import unTypiaNext from '@ryoppippi/unplugin-typia/next';

if (process.argv.includes('build')) {
    // eslint-disable-next-line unicorn/no-lonely-if
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
    const githubActionsRunId = process.env.GITHUB_ACTIONS_RUN_ID;
    let currentCommit: string | undefined = process.env.OVERRIDE_CURRENT_COMMIT;
    let currentCommitTimestamp: string | undefined =
        process.env.OVERRIDE_CURRENT_COMMIT_TS;
    let currentBranch: string | undefined = process.env.OVERRIDE_CURRENT_BRANCH;
    let currentTag: string | undefined = process.env.OVERRIDE_CURRENT_TAG;
    let remoteUrl: string | undefined = process.env.OVERRIDE_REMOTE_URL;

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
            // git describe --tags --abbrev=0 --exact-match
            try {
                currentTag = (
                    await git.raw([
                        'describe',
                        '--tags',
                        '--abbrev=0',
                        '--exact-match',
                        currentCommit,
                    ])
                ).trim();
            } catch {
                console.warn('No tag found for current commit:', currentCommit);
            } finally {
                if (!currentTag) {
                    currentTag = 'false'; // no tag found
                }
            }
        }

        if (!remoteUrl) {
            const configuredRemoteUrl = (
                await git.getConfig('remote.origin.url')
            ).value;
            if (configuredRemoteUrl) {
                remoteUrl = configuredRemoteUrl;
            }
        }
    }

    console.dir({
        currentCommit,
        currentBranch,
        currentTag,
        isInsideDocker,
        currentCommitTimestamp,
        remoteUrl,
        githubActionsRunId,
        YTDLP_PATH_OVERRIDE:
            process.env.YTDLP_PATH_OVERRIDE ?? '<hardcoded_not_set>',
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
                NEXT_PUBLIC_IS_INSIDE_DOCKER: isInsideDocker ? 'true' : 'false',
                NEXT_PUBLIC_CURRENT_COMMIT_TIMESTAMP: currentCommitTimestamp,
                NEXT_PUBLIC_REMOTE_URL: remoteUrl,
                NEXT_PUBLIC_NODEJS_VERSION: process.version,
                NEXT_PUBLIC_GITHUB_ACTIONS_RUN_ID: githubActionsRunId,
                YTDLP_PATH_OVERRIDE: process.env.YTDLP_PATH_OVERRIDE,
            },
            trailingSlash: false,
            devIndicators: {
                position: 'bottom-right',
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
                        destination: `${apiBaseUrl}/api/:path*`,
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
                localPatterns: [
                    {
                        pathname: '/api/cache/fetch',
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
                ignoreDuringBuilds: false,
            },
            typescript: {
                ignoreBuildErrors: false,
            },
        } as NextConfig,
        unpluginTypiaOptions,
    );
};

export default nextConfig;
