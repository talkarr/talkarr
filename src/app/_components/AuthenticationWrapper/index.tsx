// cannot be use-client!
import { redirect } from 'next/navigation';

import type { FC } from 'react';
import React from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { getAppStatus } from '@/app/_api/information';
import { getUserInfo } from '@/app/_api/user/info';

import { welcomePageLink } from '@/constants';
import { getServerSideTranslation } from '@/i18n/server-side';

import AppNotAvailable from '@components/AppNotAvailable';
import AuthenticationDataUpdater from '@components/AuthenticationDataUpdater';

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
    const appStatusResponse = await getAppStatus();

    const { t } = await getServerSideTranslation();

    const hasUserInfo = initialUserInfo && initialUserInfo.success !== false;
    const appStatus = appStatusResponse?.success
        ? appStatusResponse.data
        : null;

    if (!appStatus) {
        return <AppNotAvailable />;
    }

    if (appStatus.isNewInstance) {
        redirect(welcomePageLink);
    }

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
                        {t(
                            'components.authenticationWrapper.youAreNotAllowedToAccessThisPage',
                        )}
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
