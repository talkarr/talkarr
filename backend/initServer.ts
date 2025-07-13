import type http from 'http';

import express from 'express';
import pathUtils from 'path';

import rootLog from '@backend/rootLog';

const log = rootLog.child({ label: 'loadingServer' });

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

// with express 5, everything needs a name now, even wildcards.
loadingServer.get('*_', (req, res) => {
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

const startInitServer = (): http.Server => {
    let loadingHttpServer: http.Server;

    if (host) {
        log.info(`Starting startup server on http://${host}:${port}/ ...`);
        loadingHttpServer = loadingServer.listen(port, host, () => {
            log.info(`Startup server listening on http://${host}:${port}/`);
        });
    } else {
        log.info(`Starting startup server on http://localhost:${port}/ ...`);
        loadingHttpServer = loadingServer.listen(port, () => {
            log.info(`Startup server listening on http://localhost:${port}/`);
        });
    }

    return loadingHttpServer;
};

export const initServer = startInitServer();
