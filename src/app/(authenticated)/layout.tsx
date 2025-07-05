import type { FC, PropsWithChildren } from 'react';

import '@/app/globals.css';
import Navigation from '@components/Navigation';

const Layout: FC<PropsWithChildren> = ({ children }) => (
    <Navigation>{children}</Navigation>
);

export default Layout;
