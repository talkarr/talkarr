'use client';

import type { ButtonProps } from '@mui/material';
import type { TypographyProps } from '@mui/material/Typography';

import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useUiStore } from '@/providers/ui-store-provider';

import BaseModal from '@components/CustomModal';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

export interface ConfirmationModalConfig<OptionKeys extends string = string> {
    title: string;
    message: string;
    options?: {
        [key in OptionKeys]: string;
    };
    onConfirm:
        | (() => void)
        | ((options?: { [key in OptionKeys]: boolean }) => void);
    onCancel?: () => void;
    alignMessage?: TypographyProps['textAlign'];
    confirmColor?: ButtonProps['color'];
    confirmIcon?: ButtonProps['startIcon'];
    cancelColor?: ButtonProps['color'];
    cancelIcon?: ButtonProps['startIcon'];
}

const ConfirmationModal: FC = () => {
    const { t } = useTranslation();

    const confirmationModal = useUiStore(state => state.confirmationModal);
    const closeConfirmationModal = useUiStore(
        state => state.closeConfirmationModal,
    );

    const { title, message, onConfirm, onCancel, alignMessage, options } =
        confirmationModal || {};

    const [modalState, setModalState] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (options) {
            setModalState(
                Object.fromEntries(
                    Object.keys(options).map(key => [key, false]),
                ),
            );
        }
    }, [options]);

    const toggleKey = (key: string): void => {
        setModalState({
            ...modalState,
            [key]: !modalState[key],
        });
    };

    const handleCancel = (): void => {
        onCancel?.();
        closeConfirmationModal();
    };

    const handleConfirm = (): void => {
        onConfirm?.(modalState);
        closeConfirmationModal();
    };

    return (
        <BaseModal
            open={!!confirmationModal}
            onClose={handleCancel}
            title={title}
            testID="confirmation-modal"
        >
            <Box>
                <Typography variant="body1" textAlign={alignMessage || 'left'}>
                    {message}
                </Typography>
                {options ? (
                    <Box mt={2}>
                        <List disablePadding>
                            {Object.entries(options).map(([key, value]) => (
                                <ListItem key={key} disableGutters>
                                    <ListItemText primary={value} />
                                    <Switch
                                        checked={modalState[key]}
                                        onChange={e => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            toggleKey(key);
                                        }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                ) : null}
                <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
                    <Button
                        onClick={handleCancel}
                        variant="text"
                        data-testid="cancel-button"
                        startIcon={confirmationModal?.cancelIcon}
                        sx={{
                            minWidth: '120px',
                        }}
                    >
                        {t('modals.confirmationModal.cancel')}
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        variant="text"
                        color={confirmationModal?.confirmColor || 'primary'}
                        startIcon={confirmationModal?.confirmIcon}
                        data-testid="confirm-button"
                        sx={{
                            minWidth: '120px',
                        }}
                    >
                        {t('modals.confirmationModal.confirm')}
                    </Button>
                </Box>
            </Box>
        </BaseModal>
    );
};

export default ConfirmationModal;
