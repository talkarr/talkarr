import type { PartialDeep } from 'type-fest';

import deepmerge from 'deepmerge';
import { createStore } from 'zustand';
import { devtools } from 'zustand/middleware';

import type { components } from '@backend/generated/schema';

export type ApiUser = components['schemas']['User'];

export interface UserState {
    user: ApiUser | null;
}

export interface UserActions {
    setUser: (user: ApiUser | null) => void;
    clearUser: () => void;
}

export type UserStore = UserState & UserActions;

export const defaultUserState: UserState = {
    user: null,
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const createUserStore = (initialState?: PartialDeep<UserState>) =>
    createStore<UserStore>()(
        devtools(
            set => ({
                ...(deepmerge(
                    defaultUserState,
                    initialState || {},
                ) as UserState),
                setUser: user => set({ user }),
                clearUser: () => set({ user: null }),
            }),
            {
                name: 'userStore',
                enabled: process.env.NODE_ENV === 'development',
            },
        ),
    );
