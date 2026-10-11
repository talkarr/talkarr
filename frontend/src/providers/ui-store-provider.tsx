'use client';

import type { PartialDeep } from 'type-fest';

import type { FC } from 'react';
import React, { createContext, useContext, useRef } from 'react';

import { useStore } from 'zustand';

import type { UiState, UiStore } from '@/stores/ui-store';
import { createUiStore } from '@/stores/ui-store';

export type UiStoreApi = ReturnType<typeof createUiStore>;

const UiStoreContext = createContext<UiStoreApi | undefined>(undefined);

export interface UiStoreProviderProps {
    children: React.ReactNode;
    apiState?: PartialDeep<UiState>;
}

export const UiStoreProvider: FC<UiStoreProviderProps> = ({
    children,
    apiState,
}) => {
    const storeRef = useRef<UiStoreApi>(null);

    if (!storeRef.current) {
        storeRef.current = createUiStore(apiState);
    }

    return (
        <UiStoreContext.Provider value={storeRef.current}>
            {children}
        </UiStoreContext.Provider>
    );
};

export const useUiStore = <T,>(selector: (store: UiStore) => T): T => {
    const store = useContext(UiStoreContext);

    if (!store) {
        throw new Error('useUiStore must be used within a UiStoreProvider');
    }

    return useStore(store, selector);
};
