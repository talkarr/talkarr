import type { RequestBody, RequestParams } from '@backend/types';

import api from '@/utils/api';

export type MediaManagementFilesArgs =
    RequestParams<'/settings/mediamanagement/files'>;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const pListFiles = async (query: MediaManagementFilesArgs) => {
    const { data, error, response } = await api.GET(
        '/settings/mediamanagement/files',
        {
            cache: 'no-store',
            params: {
                query,
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
    const { data, error, response } = await api.GET(
        '/settings/mediamanagement/info',
        { cache: 'no-store' },
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
    const { data, error, response } = await api.POST(
        '/settings/mediamanagement/add',
        {
            body,
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
    const { data, error, response } = await api.POST(
        '/settings/mediamanagement/remove',
        {
            body,
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

export type MediaManagementRootFolderFixArgs =
    RequestBody<'/settings/mediamanagement/root-folder-fix'>;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const pRootFolderFix = async (body: MediaManagementRootFolderFixArgs) => {
    const { data, error, response } = await api.POST(
        '/settings/mediamanagement/root-folder-fix',
        {
            body,
        },
    );

    if (error) {
        return { ...error, response };
    }

    return data;
};

export type RootFolderFixResponse =
    | Awaited<ReturnType<typeof pRootFolderFix>>
    | undefined;

export const rootFolderFix: (
    query: MediaManagementRootFolderFixArgs,
) => Promise<RootFolderFixResponse> = pRootFolderFix;
