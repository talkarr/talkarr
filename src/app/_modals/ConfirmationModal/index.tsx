'use client';

import type { FC } from 'react';

import { useUiStore } from '@/providers/uiStoreProvider';

import BaseModal from '@components/CustomModal';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const ConfirmationModal: FC = () => {
    const confirmationModal = useUiStore(state => state.confirmationModal);
    const closeConfirmationModal = useUiStore(
        state => state.closeConfirmationModal,
    );

    const { title, message, onConfirm } = confirmationModal || {};

    return (
        <BaseModal
            open={!!confirmationModal}
            onClose={closeConfirmationModal}
            title={title}
            testID="confirmation-modal"
        >
            <Box>
                <Typography variant="body1">{message}</Typography>
                <Box mt={2} display="flex" justifyContent="flex-end" gap={2}>
                    <Button
                        onClick={closeConfirmationModal}
                        variant="contained"
                        color="secondary"
                        data-testid="cancel-button"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            onConfirm?.();
                            closeConfirmationModal();
                        }}
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
