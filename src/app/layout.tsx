import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import type { FC, PropsWithChildren } from 'react';

import theme from '@/theme';

import '@/app/globals.css';
import Navigation from '@components/Navigation';
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
    title: 'Talkarr',
    description: 'Download and manage your personal collection of chaos talks.',
};

const RootLayout: FC<PropsWithChildren> = ({ children }) => (
    <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable}`}>
            <AppRouterCacheProvider>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <Navigation>{children}</Navigation>
                </ThemeProvider>
            </AppRouterCacheProvider>
        </body>
    </html>
);

export default RootLayout;
