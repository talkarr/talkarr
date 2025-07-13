// cannot be use-client!
import { redirect } from 'next/navigation';

import type { FC } from 'react';
import React from 'react';

import { getUserInfo } from '@/app/_api/user/info';

import AuthenticationDataUpdater from '@components/AuthenticationDataUpdater';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export interface AuthenticationWrapperProps {
    children: React.ReactNode;
    requirement: 'authenticated' | 'unauthenticated';
    redirectUrl?: string;
}

const AuthenticationWrapper: FC<AuthenticationWrapperProps> = async ({
    children,
    requirement,
    redirectUrl,
}) => {
    const initialUserInfo = await getUserInfo();

    const hasUserInfo = initialUserInfo && initialUserInfo.success !== false;

    if (
        (requirement === 'authenticated' && !hasUserInfo) ||
        (requirement === 'unauthenticated' && hasUserInfo)
    ) {
        if (redirectUrl) {
            redirect(redirectUrl);
        } else {
            return (
                <Box>
                    <AuthenticationDataUpdater
                        initialUserInfo={
                            initialUserInfo?.success
                                ? initialUserInfo.data
                                : null
                        }
                    />
                    <Typography>
                        You are not allowed to access this page.
                    </Typography>
                </Box>
            );
        }
    }

    return (
        <>
            <AuthenticationDataUpdater
                initialUserInfo={
                    initialUserInfo?.success ? initialUserInfo.data : null
                }
            />
            {children}
        </>
    );
};

export default AuthenticationWrapper;
