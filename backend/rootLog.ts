import fs from 'node:fs';
import path from 'path';
import * as winston from 'winston';

import { logLevel } from '@backend/env';

import 'winston-daily-rotate-file';

const hformat = winston.format.printf(
    ({ level, label, message, timestamp, ...metadata }) => {
        let actualMessage = message;

        if (typeof message === 'bigint') {
            actualMessage = message.toString();
        }

        let msg = `${timestamp} [${level}]${
            label ? `[${label}]` : ''
        }: ${actualMessage} `;

        // improve above to special case error objects
        const meta = { ...metadata };

        for (const key of Object.keys(meta)) {
            // recursively check for error objects
            if (meta[key] instanceof Error) {
                meta[key] = {
                    message: meta[key].message,
                    stack: meta[key].stack,
                };
            }

            if (typeof meta[key] === 'bigint') {
                meta[key] = meta[key].toString();
            }

            if (typeof meta[key] === 'object') {
                meta[key] = JSON.parse(
                    JSON.stringify(meta[key], (k, v) =>
                        typeof v === 'bigint' ? v.toString() : v,
                    ),
                );
            }
        }

        if (Object.keys(meta).length > 0) {
            msg += JSON.stringify(meta);
        }

        return msg;
    },
);

const rootLog = winston.createLogger({
    level: logLevel,
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
                winston.format.json({
                    bigint: true,
                }),
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
    `Logger configured with level: ${rootLog.level}. 'process.env.LOG_LEVEL=${process.env.LOG_LEVEL}' 'logLevel=${logLevel}'`,
);

export default rootLog;
