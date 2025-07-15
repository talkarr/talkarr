'use client';

import type { FC } from 'react';

import type { ExtractSuccessData } from '@backend/types';

import type { GetUserInfoResponse } from '@/app/_api/user/info';

import { useUserStore } from '@/providers/userStoreProvider';

export interface AuthenticationDataUpdaterProps {
    initialUserInfo: ExtractSuccessData<GetUserInfoResponse> | null;
}

const AuthenticationDataUpdater: FC<AuthenticationDataUpdaterProps> = ({
    initialUserInfo,
}) => {
    const setUser = useUserStore(store => store.setUser);

    if (initialUserInfo) {
        setUser(initialUserInfo);
    } else {
        setUser(null);
    }

    return null;
};

export default AuthenticationDataUpdater;
