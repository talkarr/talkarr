import type { FC, PropsWithChildren } from 'react';

import AddFolderModal from '@/app/_modals/AddFolderModal';
import AddTalkModal from '@/app/_modals/AddTalkModal';
import ConfirmationModal from '@/app/_modals/ConfirmationModal';

const Layout: FC<PropsWithChildren> = ({ children }) => (
    <>
        {children}
        <AddTalkModal />
        <AddFolderModal />
        <ConfirmationModal />
    </>
);

export default Layout;
