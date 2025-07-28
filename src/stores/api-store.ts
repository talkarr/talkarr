import type { PartialDeep } from 'type-fest';

import deepmerge from 'deepmerge';
import { createStore } from 'zustand';
import { devtools } from 'zustand/middleware';

import type { SuccessData } from '@backend/types';

import type { GetAppInformationResponse } from '@/app/_api/information';
import { getAppInformation } from '@/app/_api/information';
import type { DeleteEventResponse } from '@/app/_api/talks/delete';
import { deleteEvent } from '@/app/_api/talks/delete';
import type { GetTalkResponse } from '@/app/_api/talks/get';
import { getTalk } from '@/app/_api/talks/get';
import type { TalkInfoResponse } from '@/app/_api/talks/info';
import { talkInfo } from '@/app/_api/talks/info';
import type { SearchEventsResponse } from '@/app/_api/talks/search';
import { searchEvents } from '@/app/_api/talks/search';
import { getTaskStatus } from '@/app/_api/tasks/status';
import type { TasksData } from '@/app/(authenticated)/settings/tasks/page';
import type { SingleTalkData } from '@/app/(authenticated)/talks/[slug]/page';

import type { TalkData } from '@/stores/ui-store';

export type AppInformation = SuccessData<'/information', 'get'>;

export interface ApiState {
    searchResults: SearchEventsResponse | undefined;
    talkInfo: Record<TalkData['guid'], TalkInfoResponse>;
    singleTalkData: SingleTalkData | null;
    appInformation: AppInformation | null;
    taskStatus: TasksData | null;
}

export interface ApiActions {
    doSearch: (query: string) => Promise<SearchEventsResponse | false>;
    getTalkInfo: (guid: string) => Promise<TalkInfoResponse>;
    getSingleTalkData: (
        data: { guid: string; slug?: never } | { slug: string; guid?: never },
    ) => Promise<GetTalkResponse>;
    clearSingleTalkData: () => void;
    handleDeleteTalk: (
        guid: string,
        deleteFiles: boolean,
    ) => Promise<DeleteEventResponse>;
    getAppInformationData: (options?: {
        skipIfExists?: boolean;
        doNotReload?: boolean;
        onVersionChange?: () => void;
    }) => Promise<GetAppInformationResponse>;
    getTaskStatusData: () => Promise<TasksData | null>;
}

export type ApiStore = ApiState & ApiActions;

export const defaultApiState: ApiState = {
    searchResults: undefined,
    talkInfo: {},
    singleTalkData: null,
    appInformation: null,
    taskStatus: null,
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const createApiStore = (initialState?: PartialDeep<ApiState>) =>
    createStore<ApiStore>()(
        devtools(
            (set, get) => ({
                ...(deepmerge(defaultApiState, initialState || {}) as ApiState),
                doSearch: async query => {
                    try {
                        const response = await searchEvents({ q: query });

                        set({ searchResults: response });

                        return response;
                    } catch (error) {
                        if (
                            error instanceof DOMException &&
                            error.name === 'AbortError'
                        ) {
                            return false;
                        }

                        throw error;
                    }
                },
                getTalkInfo: async guid => {
                    const response = await talkInfo({ guid, slug: '' });

                    set(state => ({
                        talkInfo: {
                            ...state.talkInfo,
                            [guid]: response,
                        },
                    }));

                    return response;
                },
                getSingleTalkData: async data => {
                    const response = await getTalk({
                        guid: data.guid || '',
                        slug: data.slug || '',
                    });

                    if (!response?.success) {
                        return response;
                    }

                    set({ singleTalkData: response.data });

                    return response;
                },
                clearSingleTalkData: () => set({ singleTalkData: null }),
                handleDeleteTalk: async (guid, deleteFiles) =>
                    deleteEvent({ guid, delete_files: deleteFiles }),
                getAppInformationData: async options => {
                    const {
                        skipIfExists = false,
                        doNotReload = false,
                        onVersionChange,
                    } = options || {};

                    const { appInformation } = get();

                    if (skipIfExists && appInformation !== null) {
                        return {
                            success: true,
                            data: appInformation,
                        } as GetAppInformationResponse;
                    }

                    const response = await getAppInformation();

                    if (!response?.success) {
                        return response;
                    }

                    const { data } = response;

                    const oldVersion = appInformation?.appVersion;
                    const newVersion = data.appVersion;

                    if (
                        typeof oldVersion === 'string' &&
                        typeof newVersion === 'string' &&
                        oldVersion !== newVersion &&
                        !doNotReload
                    ) {
                        console.warn(
                            `App version changed from ${oldVersion} to ${newVersion}. Reloading...`,
                        );
                        onVersionChange?.();
                    } else {
                        console.log(
                            `App version is still the same: ${oldVersion}==${newVersion}`,
                        );
                    }

                    set({ appInformation: data });

                    return response;
                },
                getTaskStatusData: async () => {
                    const response = await getTaskStatus();

                    if (!response?.success) {
                        return null;
                    }

                    set({ taskStatus: response.data });

                    return response.data;
                },
            }),
            {
                name: 'apiStore',
                enabled: process.env.NODE_ENV === 'development',
            },
        ),
    );
