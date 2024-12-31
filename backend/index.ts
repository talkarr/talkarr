import next from 'next';

import cookieParser from 'cookie-parser';
import type { NextFunction, Request, Response } from 'express';
import express from 'express';
import fs from 'fs';
import swaggerUi from 'swagger-ui-express';

import api from '@backend/api';
import log from '@backend/log';
import { loadSettings } from '@backend/settings';

const dev = process.env.NODE_ENV !== 'production';

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare()
    .then(async () => {
        const server = express();

        await loadSettings();

        // server.enable('trust proxy');

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
                log.info(`Server ready on http://${host}:${port}/`, {
                    label: 'Server',
                });
            });
        } else {
            server.listen(port, () => {
                log.info(`Server ready on http://localhost:${port}/`, {
                    label: 'Server',
                });
            });
        }
    })
    .catch(err => {
        log.error(err.stack);
        process.exit(1);
    });
