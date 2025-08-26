'use client';

import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import RefreshIcon from '@mui/icons-material/Refresh';

import { useUiStore } from '@/providers/ui-store-provider';

import BaseModal from '@components/CustomModal';

const VersionChangedModal: FC = () => {
    const { t } = useTranslation();
    const versionChangedModal = useUiStore(store => store.versionChangedModal);
    const closeVersionChangedModal = useUiStore(
        store => store.closeVersionChangedModal,
    );

    return (
        <BaseModal
            open={versionChangedModal}
            testID="version-changed-modal"
            title={t('modals.versionChangedModal.title')}
            onClose={closeVersionChangedModal}
            showCloseButton={process.env.NODE_ENV !== 'production'}
        >
            <Typography mb={2}>
                {t('modals.versionChangedModal.message')}
            </Typography>
            <Button
                fullWidth
                variant="contained"
                onClick={() => window.location.reload()}
                startIcon={<RefreshIcon />}
            >
                {t('modals.versionChangedModal.refreshButton')}
            </Button>
        </BaseModal>
    );
};

export default VersionChangedModal;
