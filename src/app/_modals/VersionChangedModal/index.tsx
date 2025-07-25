'use client';

import type { FC } from 'react';

import { useUiStore } from '@/providers/ui-store-provider';

import BaseModal from '@components/CustomModal';
import RefreshIcon from '@mui/icons-material/Refresh';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const VersionChangedModal: FC = () => {
    const versionChangedModal = useUiStore(store => store.versionChangedModal);
    const closeVersionChangedModal = useUiStore(
        store => store.closeVersionChangedModal,
    );

    return (
        <BaseModal
            open={versionChangedModal}
            testID="version-changed-modal"
            title="Version Changed"
            onClose={closeVersionChangedModal}
            showCloseButton={process.env.NODE_ENV !== 'production'}
        >
            <Typography mb={2}>
                The application version has changed. Please refresh the page to
                ensure you have the latest features and fixes.
            </Typography>
            <Button
                fullWidth
                variant="contained"
                onClick={() => window.location.reload()}
                startIcon={<RefreshIcon />}
            >
                Refresh Page
            </Button>
        </BaseModal>
    );
};

export default VersionChangedModal;
