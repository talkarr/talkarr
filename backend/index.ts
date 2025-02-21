import type { NextFunction, Request, Response } from 'express';

import next from 'next';

import cookieParser from 'cookie-parser';
import express from 'express';
import fs from 'node:fs';
import pathUtils from 'path';
import swaggerUi from 'swagger-ui-express';

import '@backend/workers/addTalk';
import '@backend/workers/generateMissingNfo';
import { startCheckForRootFolders } from '@backend/workers/checkForRootFolders';
import { removeAllScanAndImportExistingFiles } from '@backend/workers/scanAndImportExistingFiles';
import { removeAllScanForMissingFilesTasks } from '@backend/workers/scanForMissingFiles';

import api from '@backend/api';
import { clearDownloadingFlagForAllTalks } from '@backend/events';
import rootLog from '@backend/rootLog';
import { loadSettings } from '@backend/settings';

const dev = process.env.NODE_ENV !== 'production';

const log = rootLog.child({ label: 'server' });

log.info('Starting server...', { dev });

const loadingServer = express();

loadingServer.get('/logo.png', (req, res) => {
    res.sendFile('logo_cropped.png', {
        root: pathUtils.join(__dirname, '..', 'assets'),
    });
});

loadingServer.get('/favicon.ico', (req, res) => {
    res.sendFile('favicon.ico', {
        root: pathUtils.join(__dirname, '..', 'assets'),
    });
});

loadingServer.get('/small_logo.png', (req, res) => {
    res.sendFile('logo_cropped_small.png', {
        root: pathUtils.join(__dirname, '..', 'assets'),
    });
});

loadingServer.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
        res.status(521).json({
            message: 'Service not available',
        });

        return;
    }

    if (req.path.startsWith('/_next')) {
        res.status(521).json({
            message: 'Service not available',
        });

        return;
    }

    res.sendFile('loading.html', { root: __dirname });
});

const port = Number(process.env.PORT) || 3232;
const host = process.env.HOST;

let loadingHttpServer;

if (host) {
    log.info(`Startup server listening on http://${host}:${port}/`);
    loadingHttpServer = loadingServer.listen(port, host);
} else {
    log.info(`Startup server listening on http://localhost:${port}/`);
    loadingHttpServer = loadingServer.listen(port);
}

loadingHttpServer.on('listening', () => {
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
            server.use(express.json({ limit: '50mb' }));
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

            log.info('Server ready, closing startup server...');

            server.on('error', err => {
                log.error('Server error', { err });
                process.exit(1);
            });

            // close loading server
            loadingHttpServer.close(async err => {
                if (err) {
                    log.error('Error closing loading server', { err });
                    process.exit(1);
                }

                log.info('Startup server closed');

                if (host) {
                    server.listen(port, host, () => {
                        log.info(`Server ready on http://${host}:${port}/`);
                    });
                } else {
                    server.listen(port, () => {
                        log.info(`Server ready on http://localhost:${port}/`);
                    });
                }

                try {
                    await removeAllScanForMissingFilesTasks();
                    await removeAllScanAndImportExistingFiles();
                } catch {
                    log.warn('Error when trying to remove existing tasks');
                }

                // mark everything as not downloading
                await clearDownloadingFlagForAllTalks();

                startCheckForRootFolders({ isInit: true });
            });
        })
        .catch(err => {
            log.error('Catched Error', { stack: err.stack });
            process.exit(1);
        });
});

process.on('uncaughtException', err => {
    log.error('Uncaught Exception:', { err });
    process.exit(1);
});
