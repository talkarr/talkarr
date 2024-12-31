'use client';

import type { FC, PropsWithChildren } from 'react';

import { closeSnackbar, SnackbarProvider } from 'notistack';

import Button from '@mui/material/Button';

const NotistackProvider: FC<PropsWithChildren> = ({ children }) => (
    <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
        }}
        action={snackbarId => (
            <Button
                onClick={() => {
                    closeSnackbar(snackbarId);
                }}
                color="inherit"
            >
                Dismiss
            </Button>
        )}
    >
        {children}
    </SnackbarProvider>
);

export default NotistackProvider;
