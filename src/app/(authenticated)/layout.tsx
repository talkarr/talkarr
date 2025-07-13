import type { FC, PropsWithChildren } from 'react';

import { loginPageLink } from '@/constants';

import '@/app/globals.css';
import AuthenticationWrapper from '@components/AuthenticationWrapper';
import Navigation from '@components/Navigation';

const Layout: FC<PropsWithChildren> = ({ children }) => (
    <AuthenticationWrapper
        requirement="authenticated"
        redirectUrl={loginPageLink}
    >
        <Navigation>{children}</Navigation>
    </AuthenticationWrapper>
);

export default Layout;

export const dynamic = 'force-dynamic';
