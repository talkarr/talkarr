import deepmerge from 'deepmerge';
import type { PartialDeep } from 'type-fest';
import { createStore } from 'zustand';

import type { SearchEventsResponse } from '@/app/_api/search';
import { searchEvents } from '@/app/_api/search';

export interface ApiState {
    searchResults: SearchEventsResponse | undefined;
}

export interface ApiActions {
    doSearch: (query: string) => Promise<SearchEventsResponse>;
}

export type ApiStore = ApiState & ApiActions;

export const defaultApiState: ApiState = {
    searchResults: undefined,
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const createApiStore = (initialState?: PartialDeep<ApiState>) =>
    createStore<ApiStore>(set => ({
        ...(deepmerge(defaultApiState, initialState || {}) as ApiState),
        doSearch: async query => {
            const response = await searchEvents({ q: query });

            set({ searchResults: response });

            return response;
        },
    }));
