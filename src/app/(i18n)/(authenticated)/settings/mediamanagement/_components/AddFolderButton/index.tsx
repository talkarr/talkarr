'use client';

import { useRouter } from 'next/navigation';

import type { FC } from 'react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@mui/material/Button';

import AddFolderIcon from '@mui/icons-material/Folder';

import { useUiStore } from '@/providers/ui-store-provider';

const AddFolderButton: FC = () => {
    const { t } = useTranslation();
    const router = useRouter();

    const showModal = useUiStore(state => state.openAddFolderModal);
    const modalOpen = useUiStore(state => state.addFolderModal);

    useEffect(() => {
        if (!modalOpen) {
            router.refresh();
        }
    }, [modalOpen, router]);

    return (
        <Button
            variant="contained"
            color="primary"
            startIcon={<AddFolderIcon />}
            onClick={showModal}
            data-testid="show-add-folder-button"
            sx={{
                minWidth: '170px',
            }}
        >
            {t(
                'pages.mediaManagementSettingsPage.components.addFolderButton.addFolder',
            )}
        </Button>
    );
};

export default AddFolderButton;
