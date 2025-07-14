import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import type { FC, PropsWithChildren } from 'react';

import { getAppStatus } from '@/app/_api';

import { homePageLink, pageName } from '@/constants';

import AppNotAvailable from '@components/AppNotAvailable';
import SetupScreenWrapper from '@components/SetupScreenWrapper';

export const metadata: Metadata = {
    title: `Welcome to ${pageName}`,
};

const Layout: FC<PropsWithChildren> = async ({ children }) => {
    const appStatusResponse = await getAppStatus();

    const appStatus = appStatusResponse?.success
        ? appStatusResponse.data
        : null;

    if (!appStatus) {
        return <AppNotAvailable />;
    }

    if (!appStatus.isNewInstance) {
        redirect(homePageLink);
    }

    return <SetupScreenWrapper>{children}</SetupScreenWrapper>;
};

export default Layout;
