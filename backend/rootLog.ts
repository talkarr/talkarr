import { config } from 'dotenv';
import fs from 'node:fs';
import path from 'path';
import * as winston from 'winston';

import 'winston-daily-rotate-file';

// load .env and .env.local files. needed because this gets loaded before Next.js loads the .env files
config({
    path: [
        path.resolve(process.cwd(), '.env'),
        path.resolve(process.cwd(), '.env.local'),
    ],
});

const hformat = winston.format.printf(
    ({ level, label, message, timestamp, ...metadata }) => {
        let msg = `${timestamp} [${level}]${
            label ? `[${label}]` : ''
        }: ${message} `;
        if (Object.keys(metadata).length > 0) {
            msg += JSON.stringify(metadata);
        }
        return msg;
    },
);

const rootLog = winston.createLogger({
    level:
        process.env.LOG_LEVEL?.toLowerCase() ||
        process.env.NODE_ENV === 'production'
            ? 'info'
            : 'debug',
    format: winston.format.combine(
        winston.format.splat(),
        winston.format.timestamp(),
        hformat,
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.splat(),
                winston.format.timestamp(),
                hformat,
            ),
        }),
        /* new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../logs/talkarr-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '7d',
            createSymlink: true,
            symlinkName: 'talkarr.log',
        }), */
        new winston.transports.DailyRotateFile({
            filename: process.env.CONFIG_DIRECTORY
                ? `${process.env.CONFIG_DIRECTORY}/logs/.machinelogs-%DATE%.json`
                : path.join(__dirname, '../logs/.machinelogs-%DATE%.json'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '1d',
            createSymlink: true,
            symlinkName: '.machinelogs.json',
            format: winston.format.combine(
                winston.format.splat(),
                winston.format.timestamp(),
                winston.format.json(),
            ),
        }),
    ],
});

// make sure the logs directory exists and is writable
const logDir = path.join(__dirname, '../logs');

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

try {
    fs.accessSync(logDir, fs.constants.W_OK);
} catch (error) {
    console.error('Error accessing logs directory:', { error });
    process.exit(1);
}

rootLog.info(
    `Logger configured with level: ${rootLog.level}. 'process.env.LOG_LEVEL=${process.env.LOG_LEVEL}'`,
);

export default rootLog;
