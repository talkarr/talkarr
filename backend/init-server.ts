import type http from 'node:http';

import express from 'express';
import fs from 'node:fs';
import pathUtils from 'node:path';

import { isDatabaseConnected } from '@backend/prisma';
import rootLog from '@backend/root-log';

const log = rootLog.child({ label: 'loadingServer' });

const loadingServer = express();

const smallIconBase64 = fs
    .readFileSync(
        pathUtils.join(__dirname, '..', 'assets', 'logo_cropped_small.png'),
    )
    .toString('base64');

loadingServer.use((_req, res, next) => {
    res.setHeader(
        'Cache-Control',
        'no-store, no-cache, must-revalidate, proxy-revalidate',
    );
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');

    next();
});

loadingServer.get('/logo.png', (_req, res) => {
    res.sendFile('logo_cropped.png', {
        root: pathUtils.join(__dirname, '..', 'assets'),
    });
});

loadingServer.get('/favicon.ico', (_req, res) => {
    res.sendFile('favicon.ico', {
        root: pathUtils.join(__dirname, '..', 'assets'),
    });
});

loadingServer.get('/_loading/status', async (_req, res) => {
    res.json({
        databaseConnected: await isDatabaseConnected(),
    });
});

// with express 5, everything needs a name now, even wildcards.
loadingServer.get('*_', (req, res) => {
    if (req.path.startsWith('/api')) {
        res.status(521).json({
            success: false,
            error: 'Service not available',
        });

        return;
    }

    if (req.path.startsWith('/_next')) {
        res.status(521).json({
            success: false,
            error: 'Service not available',
        });

        return;
    }

    const loadingHtml = fs.readFileSync(
        pathUtils.join(__dirname, 'loading.html'),
        'utf8',
    );

    const replacements: { match: RegExp; replacement: string }[] = [
        {
            match: /<%=logoDataUrl=%>/g,
            replacement: `data:image/png;base64,${smallIconBase64}`,
        },
    ];

    let finalHtml = loadingHtml;

    for (const { match, replacement } of replacements) {
        finalHtml = finalHtml.replace(match, replacement);
    }

    res.send(finalHtml);
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
