import type { FC, PropsWithChildren } from 'react';

import { homePageLink } from '@/constants';

import '@/app/globals.css';
import AuthenticationWrapper from '@components/AuthenticationWrapper';
import SetupScreenWrapper from '@components/SetupScreenWrapper';

const Layout: FC<PropsWithChildren> = ({ children }) => (
    <AuthenticationWrapper
        requirement="unauthenticated"
        redirectUrl={homePageLink}
    >
        <SetupScreenWrapper>{children}</SetupScreenWrapper>
    </AuthenticationWrapper>
);

export default Layout;

export const dynamic = 'force-dynamic';
