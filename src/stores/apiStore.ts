import type { PartialDeep } from 'type-fest';

import deepmerge from 'deepmerge';
import { createStore } from 'zustand';

import type { TalkInfoResponse } from '@/app/_api/talks/info';
import { talkInfo } from '@/app/_api/talks/info';
import type { SearchEventsResponse } from '@/app/_api/talks/search';
import { searchEvents } from '@/app/_api/talks/search';

import type { TalkData } from '@/stores/uiStore';

export interface ApiState {
    searchResults: SearchEventsResponse | undefined;
    talkInfo: Record<TalkData['guid'], TalkInfoResponse>;
}

export interface ApiActions {
    doSearch: (query: string) => Promise<SearchEventsResponse | false>;
    getTalkInfo: (guid: string) => Promise<TalkInfoResponse>;
}

export type ApiStore = ApiState & ApiActions;

export const defaultApiState: ApiState = {
    searchResults: undefined,
    talkInfo: {},
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const createApiStore = (initialState?: PartialDeep<ApiState>) =>
    createStore<ApiStore>(set => ({
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
    }));
