import type { QueueOptions } from 'bull';

import rootLog from '@backend/rootLog';

const log = rootLog.child({ label: 'redis' });

export const redisConnection: QueueOptions['redis'] = (() => {
    let host = 'localhost';
    let port = 6379;
    let password = '';
    let fromEnv = false;

    if (process.env.REDIS_HOST) {
        fromEnv = true;
        host = process.env.REDIS_HOST;
    }

    if (process.env.REDIS_PORT) {
        fromEnv = true;
        port = Number(process.env.REDIS_PORT);
    }

    if (process.env.REDIS_PASSWORD) {
        fromEnv = true;
        password = process.env.REDIS_PASSWORD;
    }

    if (fromEnv) {
        log.info('Using Redis settings from environment variables.', {
            host,
            port,
            password: password ? 'yes' : 'no',
        });
    } else {
        log.info('Using default Redis settings.', {
            host,
            port,
            password: password ? 'yes' : 'no',
        });
    }

    return {
        host,
        port,
        password: password || undefined,
    };
})();

export default { redisConnection };
