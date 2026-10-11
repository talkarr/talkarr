'use client';

import type { FC, PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@mui/material/Button';

import { closeSnackbar, SnackbarProvider } from 'notistack';

const NotistackProvider: FC<PropsWithChildren> = ({ children }) => {
    const { t } = useTranslation();

    return (
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
                    {t('components.notistackProvider.dismiss')}
                </Button>
            )}
            autoHideDuration={4500}
            preventDuplicate
        >
            {children}
        </SnackbarProvider>
    );
};

export default NotistackProvider;
