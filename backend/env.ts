import { config } from 'dotenv';
import path from 'path';

// load .env and .env.local files. needed because this gets loaded before Next.js loads the .env files
config({
    path: [
        path.resolve(process.cwd(), '.env'),
        path.resolve(process.cwd(), '.env.local'),
    ],
});

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
