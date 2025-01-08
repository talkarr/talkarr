'use client';

import type { PartialDeep } from 'type-fest';

import type { FC } from 'react';
import React, { createContext, useContext, useRef } from 'react';

import { useStore } from 'zustand';

import type { ApiState, ApiStore } from '@/stores/apiStore';
import { createApiStore } from '@/stores/apiStore';

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
    const storeRef = useRef<ApiStoreApi>(null);

    if (!storeRef.current) {
        storeRef.current = createApiStore(apiState);
    }

    return (
        <ApiStoreContext.Provider value={storeRef.current}>
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
