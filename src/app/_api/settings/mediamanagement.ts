import type { RequestBody, RequestParams } from '@backend/types';

import { getCookiesForApi } from '@/app/_api';

import api from '@/utils/api';

export type MediaManagementFilesArgs =
    RequestParams<'/settings/mediamanagement/files'>;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const pListFiles = async (query: MediaManagementFilesArgs) => {
    const cookie = await getCookiesForApi();

    const { data, error, response } = await api.GET(
        '/settings/mediamanagement/files',
        {
            cache: 'no-store',
            params: {
                query,
            },
            headers: {
                cookie,
            },
        },
    );

    if (error) {
        return { ...error, response };
    }

    return data;
};

export type ListFilesResponse =
    | Awaited<ReturnType<typeof pListFiles>>
    | undefined;

export const listFiles: (
    query: MediaManagementFilesArgs,
) => Promise<ListFilesResponse> = pListFiles;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const pGetConfig = async () => {
    const cookie = await getCookiesForApi();

    const { data, error, response } = await api.GET(
        '/settings/mediamanagement/info',
        { cache: 'no-store', headers: { cookie } },
    );

    if (error) {
        return { ...error, response };
    }

    return data;
};

export type GetConfigResponse =
    | Awaited<ReturnType<typeof pGetConfig>>
    | undefined;

export const getConfig: () => Promise<GetConfigResponse> = pGetConfig;

export type MediaManagementAddFolderArgs =
    RequestBody<'/settings/mediamanagement/add'>;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const pAddFolder = async (body: MediaManagementAddFolderArgs) => {
    const cookie = await getCookiesForApi();

    const { data, error, response } = await api.POST(
        '/settings/mediamanagement/add',
        {
            body,
            headers: {
                cookie,
            },
        },
    );

    if (error) {
        return { ...error, response };
    }

    return data;
};

export type AddFolderResponse =
    | Awaited<ReturnType<typeof pAddFolder>>
    | undefined;

export const addFolder: (
    query: MediaManagementAddFolderArgs,
) => Promise<AddFolderResponse> = pAddFolder;

export type MediaManagementRemoveFolderArgs =
    RequestBody<'/settings/mediamanagement/remove'>;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const pRemoveFolder = async (body: MediaManagementRemoveFolderArgs) => {
    const cookie = await getCookiesForApi();

    const { data, error, response } = await api.POST(
        '/settings/mediamanagement/remove',
        {
            body,
            headers: {
                cookie,
            },
        },
    );

    if (error) {
        return { ...error, response };
    }

    return data;
};

export type RemoveFolderResponse =
    | Awaited<ReturnType<typeof pRemoveFolder>>
    | undefined;

export const removeFolder: (
    query: MediaManagementRemoveFolderArgs,
) => Promise<RemoveFolderResponse> = pRemoveFolder;
