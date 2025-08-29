import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import type { FC, PropsWithChildren } from 'react';

import { getUserInfo } from '@/app/_api/user/info';

import { getServerSideTranslation } from '@/i18n/server-side';
import { ApiStoreProvider } from '@/providers/api-store-provider';
import { UiStoreProvider } from '@/providers/ui-store-provider';
import { UserStoreProvider } from '@/providers/user-store-provider';
import theme from '@/theme';

import '@/app/globals.css';
import { ThemeProvider } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const generateMetadata = async (): Promise<Metadata> => {
    const { t } = await getServerSideTranslation();
    return {
        title: {
            absolute: t('application.name'),
            template: `%s | ${t('application.name')}`,
        },
        description: t('application.description'),
    };
};

const RootLayout: FC<PropsWithChildren> = async ({ children }) => {
    const initialUserInfo = await getUserInfo();
    const { t, i18n } = await getServerSideTranslation();

    return (
        <html lang={i18n.language}>
            <body className={`${geistSans.variable} ${geistMono.variable}`}>
                <div id="translations-working">{t('application.name')}</div>
                <AppRouterCacheProvider>
                    <ThemeProvider theme={theme}>
                        <CssBaseline />
                        <UserStoreProvider
                            apiState={{
                                user: initialUserInfo?.success
                                    ? initialUserInfo.data
                                    : null,
                            }}
                        >
                            <ApiStoreProvider>
                                <UiStoreProvider>{children}</UiStoreProvider>
                            </ApiStoreProvider>
                        </UserStoreProvider>
                    </ThemeProvider>
                </AppRouterCacheProvider>
            </body>
        </html>
    );
};

export default RootLayout;
