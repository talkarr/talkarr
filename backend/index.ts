import type { NextFunction, Request, Response } from 'express';

import next from 'next';

import cookieParser from 'cookie-parser';
import express from 'express';
import fs from 'node:fs';
import swaggerUi from 'swagger-ui-express';

import '@backend/workers/addTalk';
import '@backend/workers/generateMissingNfo';
import { startScanAndImportExistingFiles } from '@backend/workers/scanAndImportExistingFiles';
import { startScanForMissingFiles } from '@backend/workers/scanForMissingFiles';

import api from '@backend/api';
import rootLog from '@backend/rootLog';
import { loadSettings } from '@backend/settings';

const dev = process.env.NODE_ENV !== 'production';

const log = rootLog.child({ label: 'server' });

log.info('Starting server...');

const app = next({ dev, turbopack: true });
const handle = app.getRequestHandler();

log.info('Preparing server...');

app.prepare()
    .then(async () => {
        log.info('Server prepared');
        const server = express();

        await loadSettings();

        if (process.env.NODE_ENV === 'production') {
            server.set('trust proxy', 1);
        }

        server.use(cookieParser());
        server.use(express.json());
        server.use(express.urlencoded({ extended: true }));

        server.use('/api', api);

        const apiDocs = fs.readFileSync('./backend.json', 'utf-8');
        server.use(
            '/api-docs',
            swaggerUi.serve,
            swaggerUi.setup(JSON.parse(apiDocs)),
        );

        server.all('*', (req, res) => handle(req, res));
        server.use(
            (
                err: { status: number; message: string; errors: string[] },
                _req: Request,
                res: Response,
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                _next: NextFunction,
            ) => {
                res.status(err.status || 500).json({
                    message: err.message,
                    errors: err.errors,
                });
            },
        );

        const port = Number(process.env.PORT) || 3232;
        const host = process.env.HOST;
        if (host) {
            server.listen(port, host, () => {
                log.info(`Server ready on http://${host}:${port}/`);
            });
        } else {
            server.listen(port, () => {
                log.info(`Server ready on http://localhost:${port}/`);
            });
        }

        startScanForMissingFiles({});

        startScanAndImportExistingFiles();
    })
    .catch(err => {
        log.error('Catched Error', { stack: err.stack });
        process.exit(1);
    });

process.on('uncaughtException', err => {
    log.error('Uncaught Exception:', { err });
    process.exit(1);
});
