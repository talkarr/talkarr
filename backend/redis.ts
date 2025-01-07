import type { QueueOptions } from 'bull';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = (() => {
    const port = process.env.REDIS_PORT;
    if (port) {
        return parseInt(port, 10);
    }
    return 6379;
})();

export const redisConnection: QueueOptions['redis'] = {
    host: REDIS_HOST,
    port: REDIS_PORT,
};

export default { redisConnection };
