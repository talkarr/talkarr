'use client';

import type { PartialDeep } from 'type-fest';

import type { FC } from 'react';
import React, { createContext, useContext, useState } from 'react';

import { useStore } from 'zustand';

import type { ApiState, ApiStore } from '@/stores/api-store';
import { createApiStore } from '@/stores/api-store';

export type ApiStoreApi = ReturnType<typeof createApiStore>;

const ApiStoreContext = createContext<ApiStoreApi | undefined>(undefined);

export interface ApiStoreProviderProps {
    children: React.ReactNode;
    apiState?: PartialDeep<ApiState>;
}

export const ApiStoreProvider: FC<ApiStoreProviderProps> = ({
    children,
    apiState,
}) => {
    const [store] = useState<ApiStoreApi>(() => createApiStore(apiState));

    return (
        <ApiStoreContext.Provider value={store}>
            {children}
        </ApiStoreContext.Provider>
    );
};

export const useApiStore = <T,>(selector: (store: ApiStore) => T): T => {
    const store = useContext(ApiStoreContext);

    if (!store) {
        throw new Error('useApiStore must be used within a ApiStoreProvider');
    }

    return useStore(store, selector);
};
