'use client';

import { useRouter } from 'next/navigation';

import type { FC } from 'react';
import { useEffect } from 'react';

import { useUiStore } from '@/providers/ui-store-provider';

import AddFolderIcon from '@mui/icons-material/Folder';
import Button from '@mui/material/Button';

const AddFolderButton: FC = () => {
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
            Add Folder
        </Button>
    );
};

export default AddFolderButton;
