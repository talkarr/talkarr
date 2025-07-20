import type { RequestBody } from '@backend/types';

import api from '@/utils/api';

export type VerifyJsonImportBody = RequestBody<'/talks/import/verify'>;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const pVerifyJsonImport = async (body: VerifyJsonImportBody) => {
    const { data, error, response } = await api.POST('/talks/import/verify', {
        body,
    });

    if (error) {
        return { ...error, response };
    }

    return data;
};

export type VerifyJsonImportResponse =
    | Awaited<ReturnType<typeof pVerifyJsonImport>>
    | undefined;

export const verifyJsonImport: (
    body: VerifyJsonImportBody,
) => Promise<VerifyJsonImportResponse> = pVerifyJsonImport;

export type ImportJsonBody = RequestBody<'/talks/import'>;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const pImportJson = async (body: ImportJsonBody) => {
    const { data, error, response } = await api.POST('/talks/import', {
        body,
    });

    if (error) {
        return { ...error, response };
    }

    return data;
};

export type ImportJsonResponse = Awaited<ReturnType<typeof pImportJson>>;

export const importJson: (body: ImportJsonBody) => Promise<ImportJsonResponse> =
    pImportJson;
