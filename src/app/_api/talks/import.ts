import type { RequestBody } from '@backend/types';

import api, { wrapApiCall } from '@/utils/api';

export type VerifyJsonImportBody = RequestBody<'/talks/import/fahrplan/verify'>;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const pVerifyJsonImport = async (body: VerifyJsonImportBody) => {
    const { data, error, response } = await api.POST(
        '/talks/import/fahrplan/verify',
        {
            body,
        },
    );

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
) => Promise<VerifyJsonImportResponse> = wrapApiCall(pVerifyJsonImport);

export type ImportJsonBody = RequestBody<'/talks/import/fahrplan'>;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const pImportJson = async (body: ImportJsonBody) => {
    const { data, error, response } = await api.POST('/talks/import/fahrplan', {
        body,
    });

    if (error) {
        return { ...error, response };
    }

    return data;
};

export type ImportJsonResponse = Awaited<ReturnType<typeof pImportJson>>;

export const importJson: (body: ImportJsonBody) => Promise<ImportJsonResponse> =
    wrapApiCall(pImportJson);

export type ImportScheduleBody = RequestBody<'/talks/import/schedule'>;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const pImportSchedule = async (body: ImportScheduleBody) => {
    const { data, error, response } = await api.POST('/talks/import/schedule', {
        body,
    });

    if (error) {
        return { ...error, response };
    }

    return data;
};

export type ImportScheduleResponse = Awaited<
    ReturnType<typeof pImportSchedule>
>;

export const importSchedule: (
    body: ImportScheduleBody,
) => Promise<ImportScheduleResponse> = wrapApiCall(pImportSchedule);
