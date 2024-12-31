import rootLog from '@backend/rootLog';

const log = rootLog.child({ label: 'fetch' });

type FetchArgs = Parameters<typeof fetch>;

const apiFetch = (...args: FetchArgs): ReturnType<typeof fetch> => {
    const url = args[0];

    log.info(`Fetching ${url}`);

    return fetch(...args);
};

export default apiFetch;
