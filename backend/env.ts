import { config } from 'dotenv';
import path from 'node:path';
import { simpleGit } from 'simple-git';

// load .env and .env.local files. needed because this gets loaded before Next.js loads the .env files
config({
    path: [
        path.resolve(process.cwd(), '.env'),
        path.resolve(process.cwd(), '.env.local'),
    ],
});

let privateGitDescribeResult: string | undefined;

const overrideCurrentVersion = process.env.OVERRIDE_CURRENT_VERSION;
export const getAppVersion = (): string =>
    overrideCurrentVersion || privateGitDescribeResult || 'unknown';

export const serverPort = Number(process.env.TALKARR_PORT) || 3232;
export const serverHost = process.env.TALKARR_HOST;
export const serverSecret = process.env.TALKARR_SECRET || '';
export const logLevel =
    process.env.TALKARR_LOG_LEVEL?.toLowerCase() ||
    (process.env.NODE_ENV === 'production' ? 'info' : 'debug');
export const configDirectory =
    process.env.TALKARR_CONFIG_DIRECTORY || path.join(process.cwd(), 'config');

if (!serverSecret) {
    throw new Error(
        'No TALKARR_SECRET set in .env or .env.local. Please set it to a random string.',
    );
}

if (!configDirectory) {
    throw new Error(
        'No TALKARR_CONFIG_DIRECTORY set in .env or .env.local. Please set it to a valid directory path.',
    );
}

if (process.env.NODE_ENV === 'development') {
    console.dir({
        serverPort,
        serverHost,
        serverSecret,
        logLevel,
        configDirectory,
    });
}

export const initEnv = async (): Promise<void> => {
    // eslint-disable-next-line import/no-cycle
    const { default: rootLog } = await import('@backend/root-log');

    const log = rootLog.child({ label: 'env' });
    const git = simpleGit();

    try {
        privateGitDescribeResult = await git.raw([
            'describe',
            '--tags',
            '--always',
        ]);
        privateGitDescribeResult = privateGitDescribeResult.trim();
    } catch (error) {
        log.debug('Failed to get git commit hash:', error);
        privateGitDescribeResult = undefined;
    }

    log.info(
        `Git commit hash: ${privateGitDescribeResult} (from simple-git), override version: ${overrideCurrentVersion}`,
    );
};

export const getIsNightly = (): boolean => {
    const overrideCurrentTag = process.env.OVERRIDE_CURRENT_TAG;
    return overrideCurrentTag === 'false' || overrideCurrentTag === undefined;
};
