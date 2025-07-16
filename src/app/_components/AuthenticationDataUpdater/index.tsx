'use client';

import type { FC } from 'react';
import { useEffect } from 'react';

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

    useEffect(() => {
        if (initialUserInfo) {
            setUser(initialUserInfo);
        } else {
            setUser(null);
        }
    }, [initialUserInfo, setUser]);

    return null;
};

export default AuthenticationDataUpdater;
