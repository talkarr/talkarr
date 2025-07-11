import { config } from 'dotenv';
import path from 'path';

// load .env and .env.local files. needed because this gets loaded before Next.js loads the .env files
config({
    path: [
        path.resolve(process.cwd(), '.env'),
        path.resolve(process.cwd(), '.env.local'),
    ],
});

export const serverPort = Number(process.env.PORT) || 3232;
export const serverHost = process.env.HOST;
