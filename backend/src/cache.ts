import { Cache } from 'memory-cache';

import rootLog from '@backend/src/root-log';

const log = rootLog.child({ label: 'cache' });

const cache = new Cache();

log.info('Cache initialized.');

export default cache;
