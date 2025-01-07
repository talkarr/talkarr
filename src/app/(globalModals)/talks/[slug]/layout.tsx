import type { FC, PropsWithChildren } from 'react';

import TalkToolbar from '@/app/(globalModals)/talks/[slug]/_components/TalkToolbar';

const Layout: FC<PropsWithChildren> = ({ children }) => (
    <>
        <TalkToolbar />
        {children}
    </>
);

export default Layout;
