'use client';

import type { ButtonProps } from '@mui/material';
import type { TypographyProps } from '@mui/material/Typography';

import type { FC } from 'react';
import { useEffect, useState } from 'react';

import { useUiStore } from '@/providers/uiStoreProvider';

import BaseModal from '@components/CustomModal';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
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
    cancelColor?: ButtonProps['color'];
}

const ConfirmationModal: FC = () => {
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
                <Typography
                    variant="body1"
                    textAlign={alignMessage || 'center'}
                >
                    {message}
                </Typography>
                {options ? (
                    <Box mt={2}>
                        <List>
                            {Object.entries(options).map(([key, value]) => (
                                <ListItem key={key}>
                                    <ListItemButton
                                        onClick={() => toggleKey(key)}
                                    >
                                        <ListItemText primary={value} />
                                        <Checkbox
                                            checked={modalState[key]}
                                            onChange={e => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                toggleKey(key);
                                            }}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                ) : null}
                <Box mt={2} display="flex" justifyContent="flex-end" gap={2}>
                    <Button
                        onClick={handleCancel}
                        variant="contained"
                        color="secondary"
                        data-testid="cancel-button"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        variant="contained"
                        color={confirmationModal?.confirmColor || 'primary'}
                        data-testid="confirm-button"
                    >
                        Confirm
                    </Button>
                </Box>
            </Box>
        </BaseModal>
    );
};

export default ConfirmationModal;
