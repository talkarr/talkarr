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
        SnackbarProps={{
            // @ts-expect-error
            'data-testid': 'snackbar',
        }}
        action={snackbarId => (
            <Button
                onClick={() => {
                    closeSnackbar(snackbarId);
                }}
                color="inherit"
                data-testid="snackbar-dismiss"
            >
                Dismiss
            </Button>
        )}
    >
        {children}
    </SnackbarProvider>
);

export default NotistackProvider;
