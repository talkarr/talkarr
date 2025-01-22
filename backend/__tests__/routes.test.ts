import fs from 'node:fs';

const port = process.env.PORT || 3232;
const host = process.env.HOST || 'localhost';

describe('routes', () => {
    const openApiSpec = fs.readFileSync('../backend.json', 'utf8');

    test('should have a valid port', async () => {
        expect(port).toBeTruthy();
    });

    test('should have a valid host', async () => {
        expect(host).toBeTruthy();
    });

    // healthz should be available
    test('should have a valid healthz route', async () => {
        const response = await fetch(`http://${host}:${port}/api/healthz`);

        expect(response.status).toBe(200);
    });

    test('should have a valid openapi spec', async () => {
        expect(openApiSpec).toBeTruthy();
    });

    test('should have a valid openapi spec', async () => {
        const openApiSpecJson = JSON.parse(openApiSpec);
        expect(openApiSpecJson).toBeTruthy();
    });

    const parsed = JSON.parse(openApiSpec);

    const { paths } = parsed;

    test('should have a valid paths object', async () => {
        expect(paths).toBeTruthy();
    });

    test('should have a valid paths object', async () => {
        expect(Object.keys(paths).length).toBeGreaterThan(0);
    });

    const validMethods = [
        'get',
        'post',
        'put',
        'delete',
        'patch',
        'options',
        'head',
        'trace',
    ];

    test('should have valid methods', async () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for await (const [path, methods] of Object.entries(paths)) {
            for await (const [method] of Object.entries(
                methods as Record<string, unknown>,
            )) {
                expect(validMethods).toContain(method);
            }
        }
    });

    test('all paths should be reachable', async () => {
        for await (const [path, methods] of Object.entries(paths)) {
            for await (const [method] of Object.entries(
                methods as Record<string, unknown>,
            )) {
                const url = `http://${host}:${port}/api${path}`;

                const response = await fetch(url, {
                    method,
                });

                if (response.status === 404) {
                    console.error(`Failed to fetch ${url}`);
                }

                expect(response.status).not.toBe(404);

                const text = await response.text();
                expect(text).not.toBe('Not Found');
            }
        }
    });
});
