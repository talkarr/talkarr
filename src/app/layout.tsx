import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import type { FC, PropsWithChildren } from 'react';

import { getUserInfo } from '@/app/_api/user/info';

import { pageName } from '@/constants';
import { ApiStoreProvider } from '@/providers/api-store-provider';
import { UiStoreProvider } from '@/providers/ui-store-provider';
import { UserStoreProvider } from '@/providers/user-store-provider';
import theme from '@/theme';

import '@/app/globals.css';
import NotistackProvider from '@components/NotistackProvider';
import { ThemeProvider } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: {
        absolute: pageName,
        template: `%s | ${pageName}`,
    },
    description: 'Download and manage your personal collection of chaos talks.',
};

const RootLayout: FC<PropsWithChildren> = async ({ children }) => {
    const initialUserInfo = await getUserInfo();

    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable}`}>
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
                                <UiStoreProvider>
                                    <NotistackProvider>
                                        {children}
                                    </NotistackProvider>
                                </UiStoreProvider>
                            </ApiStoreProvider>
                        </UserStoreProvider>
                    </ThemeProvider>
                </AppRouterCacheProvider>
            </body>
        </html>
    );
};

export default RootLayout;
