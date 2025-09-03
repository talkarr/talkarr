import type {
    Conference,
    Event as DbEvent,
    EventInfo,
    File as DbFile,
    Person,
    RootFolder,
    Tag,
} from '@prisma/client';
import type express from 'express';
import type * as core from 'express-serve-static-core';
import type { Method } from 'openapi-typescript';
import type { PathsWithMethod } from 'openapi-typescript-helpers';

import type { components, paths } from '@backend/generated/schema';

import { EventProblemType } from '@prisma/client';

export type ExtractSuccessData<T> = T extends { success: true; data: infer D }
    ? D
    : never;

export type SuccessData<
    P extends keyof paths,
    M extends keyof paths[P],
> = paths[P][M] extends {
    responses: {
        200: {
            content: { 'application/json': { success: true; data: infer T } };
        };
    };
}
    ? T
    : null;

export interface SuccessResponse<
    P extends keyof paths,
    M extends keyof paths[P],
> {
    success: true;
    data: SuccessData<P, M>;
}

export interface ErrorResponse {
    success: false;
    error: string;
}

export type ApiResponse<P extends keyof paths, M extends keyof paths[P]> =
    | SuccessResponse<P, M>
    | ErrorResponse;

export type ExpressResponse<
    P extends keyof paths,
    M extends keyof paths[P],
> = express.Response<ApiResponse<P, M>>;

export type RequestBody<
    P extends PathsWithMethod<paths, M>,
    M extends Method = 'post',
> = paths[P][M] extends {
    requestBody: { content: { 'application/json': object } };
}
    ? paths[P][M]['requestBody']['content']['application/json']
    : never;

export type ExpressRequestBody<
    P extends PathsWithMethod<paths, M>,
    M extends Method = 'post',
> = paths[P][M] extends {
    requestBody: { content: { 'application/json': object } };
}
    ? Partial<paths[P][M]['requestBody']['content']['application/json']>
    : never;

export type ExpressPostRequest<
    P extends PathsWithMethod<paths, M>,
    M extends Method = 'post',
> = express.Request<core.ParamsDictionary, unknown, ExpressRequestBody<P, M>>;

export type ExpressGetRequest<
    P extends PathsWithMethod<paths, M>,
    M extends Method = 'get',
> = express.Request<
    core.ParamsDictionary,
    unknown,
    unknown,
    RequestParams<P, M>
>;

type User = components['schemas']['User'] | null;

export type ExpressRequest<
    P extends PathsWithMethod<paths, M>,
    M extends Method,
> = M extends 'get'
    ? ExpressGetRequest<P, M> & {
          user?: User;
      }
    : M extends 'post'
      ? ExpressPostRequest<P, M> & {
            user?: User;
        }
      : never;

export type RequestParams<
    T extends PathsWithMethod<paths, M>,
    M extends Method = 'get',
> = paths[T][M] extends { parameters: { query: object } }
    ? paths[T][M]['parameters']['query']
    : paths[T][M] extends { parameters?: { query?: object } }
      ? Required<Required<paths[T][M]['parameters']>['query']>
      : never;

export type ExtractErrorData<T> = T extends { success: false; error: infer E }
    ? E
    : never;

export type ConvertDateToStringType<T> = T extends Date
    ? string
    : T extends object
      ? { [K in keyof T]: ConvertDateToStringType<T[K]> }
      : T;

export type BigintToNumber<T> = T extends bigint ? number : T;

export type ConvertBigintToNumberType<T> = T extends object
    ? { [K in keyof T]: ConvertBigintToNumberType<T[K]> }
    : BigintToNumber<T>;

export type NormalAndConvertedDate<T> = T | ConvertDateToStringType<T>;

export type ApiEvent = components['schemas']['Event'];

export type ApiConference = components['schemas']['Conference'];

export type TalkInfo = components['schemas']['TalkInfo'];

export type ImportJsonResponse = components['schemas']['ImportJsonResponse'];

export const problemMap: Record<EventProblemType, string> = {
    [EventProblemType.NoRootFolder]: 'No root folder',
    [EventProblemType.NoEventInfoGuid]: 'No event info guid',
    [EventProblemType.RootFolderMarkNotFound]:
        'Root folder mark not found, possibly unmounted filesystem',
    [EventProblemType.HasDownloadError]:
        'Has download error, check media item page',
};

export enum AddTalkFailure {
    Duplicate,
    Other,
}

export type DbEventWithFolder = DbEvent & {
    root_folder: RootFolder;
};

export interface ExtendedDbEvent extends DbEventWithFolder {
    persons: Person[];
    tags: Tag[];
    conference: Conference;
    eventInfo?: EventInfo | null;
    file?: DbFile[] | null;
}

export interface EventFahrplanJsonImport {
    lectures: {
        slug: string;
        title: string;
        recorded?: boolean;
    }[];
}

export type TypeOrPick<T, K extends keyof T> = T | Pick<T, K>;

export type Enum<E> = Record<keyof E, number | string> & {
    [k: number]: string;
};
