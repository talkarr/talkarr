import { cookies } from 'next/headers';

import type { FC, PropsWithChildren } from 'react';

import { cookieName } from '@/i18n';

import UseClientI18n from '@components/UseClientI18n';

const Layout: FC<PropsWithChildren> = async ({ children }) => {
    const cookieStore = await cookies();
    const locale = cookieStore.get(cookieName)?.value;

    return <UseClientI18n cookieLocale={locale}>{children}</UseClientI18n>;
};

export default Layout;
