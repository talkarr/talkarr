'use client';

import type { PartialDeep } from 'type-fest';

import type { FC } from 'react';
import React, { createContext, useContext, useRef } from 'react';

import { useStore } from 'zustand';

import type { UserState, UserStore } from '@/stores/user-store';
import { createUserStore } from '@/stores/user-store';

export type UserStoreApi = ReturnType<typeof createUserStore>;

const UserStoreContext = createContext<UserStoreApi | undefined>(undefined);

export interface UserStoreProviderProps {
    children: React.ReactNode;
    apiState?: PartialDeep<UserState>;
}

export const UserStoreProvider: FC<UserStoreProviderProps> = ({
    children,
    apiState,
}) => {
    const storeRef = useRef<UserStoreApi>(null);

    if (!storeRef.current) {
        storeRef.current = createUserStore(apiState);
    }

    return (
        <UserStoreContext.Provider value={storeRef.current}>
            {children}
        </UserStoreContext.Provider>
    );
};

export const useUserStore = <T,>(selector: (store: UserStore) => T): T => {
    const store = useContext(UserStoreContext);

    if (!store) {
        throw new Error('useUiStore must be used within a UiStoreProvider');
    }

    return useStore(store, selector);
};
