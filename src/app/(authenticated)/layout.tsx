import type { FC, PropsWithChildren } from 'react';

import AddFolderModal from '@/app/_modals/AddFolderModal';
import AddTalkModal from '@/app/_modals/AddTalkModal';
import ConfirmationModal from '@/app/_modals/ConfirmationModal';
import InformationModal from '@/app/_modals/InformationModal';
import RootFolderErrorModal from '@/app/_modals/RootFolderErrorModal';

import { loginPageLink } from '@/constants';

import '@/app/globals.css';
import AuthenticationWrapper from '@components/AuthenticationWrapper';
import Navigation from '@components/Navigation';

const Layout: FC<PropsWithChildren> = ({ children }) => (
    <>
        <AuthenticationWrapper
            requirement="authenticated"
            redirectUrl={loginPageLink}
        >
            <Navigation>{children}</Navigation>
        </AuthenticationWrapper>
        <AddTalkModal />
        <AddFolderModal />
        <ConfirmationModal />
        <RootFolderErrorModal />
        <InformationModal />
    </>
);

export default Layout;

export const dynamic = 'force-dynamic';
