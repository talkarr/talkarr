import log from '@backend/log';

type FetchArgs = Parameters<typeof fetch>;

const apiFetch = (...args: FetchArgs): ReturnType<typeof fetch> => {
    const url = args[0];

    log.info(`Fetching ${url}`);

    return fetch(...args);
};

export default apiFetch;
