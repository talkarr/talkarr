import type { Event as DbEvent } from '.prisma/client';
import type { Conference, Person, RootFolder, Tag } from '@prisma/client';
import type express from 'express';
import type * as core from 'express-serve-static-core';
import type { Method } from 'openapi-typescript';
import type { PathsWithMethod } from 'openapi-typescript-helpers';

import type { components, paths } from '@backend/generated/schema';

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

export type ExpressPostRequest<
    P extends PathsWithMethod<paths, M>,
    M extends Method = 'post',
> = express.Request<core.ParamsDictionary, unknown, Partial<RequestBody<P, M>>>;

export type ExpressGetRequest<
    P extends PathsWithMethod<paths, M>,
    M extends Method = 'get',
> = express.Request<
    core.ParamsDictionary,
    unknown,
    unknown,
    RequestParams<P, M>
>;

export type ExpressRequest<
    P extends PathsWithMethod<paths, M>,
    M extends Method,
> = M extends 'get'
    ? ExpressGetRequest<P, M>
    : M extends 'post'
      ? ExpressPostRequest<P, M>
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

export type NormalAndConvertedDate<T> = T | ConvertDateToStringType<T>;

export type ApiEvent = components['schemas']['Event'];

export type TalkInfo = components['schemas']['TalkInfo'];

export enum AddTalkFailure {
    Duplicate,
    Other,
}

export interface ExtendedDbEvent extends DbEvent {
    persons: Person[];
    tags: Tag[];
    conference: Conference;
    root_folder: RootFolder;
}
