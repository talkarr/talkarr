import { redirect } from 'next/navigation';

import type { FC, PropsWithChildren } from 'react';

import { getAppStatus } from '@/app/_api';

import { homePageLink } from '@/constants';

import AppNotAvailable from '@components/AppNotAvailable';
import SetupScreenWrapper from '@components/SetupScreenWrapper';

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
