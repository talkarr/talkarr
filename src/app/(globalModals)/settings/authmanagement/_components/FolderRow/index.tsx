'use client';

import { useRouter } from 'next/navigation';

import type { FC } from 'react';

import { enqueueSnackbar } from 'notistack';
import prettyBytes from 'pretty-bytes';

import { removeFolder } from '@/app/_api/settings/mediamanagement';

import { useUiStore } from '@/providers/uiStoreProvider';

import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

export interface FolderRowProps {
    folder: string;
    freeSpace: number;
}

const FolderRow: FC<FolderRowProps> = ({ folder, freeSpace }) => {
    const showConfirmDelete = useUiStore(state => state.showConfirmationModal);
    const router = useRouter();

    const handleDelete = (): void => {
        showConfirmDelete({
            title: 'Delete Folder',
            message: `Are you sure you want to delete the folder "${folder}"?`,
            confirmColor: 'error',
            onConfirm: async () => {
                const response = await removeFolder({ folder });

                if (response) {
                    if (response.success) {
                        router.refresh();
                        enqueueSnackbar('Folder deleted', {
                            variant: 'success',
                        });
                    } else {
                        enqueueSnackbar(
                            `Failed to delete folder: ${response.error}`,
                            { variant: 'error' },
                        );
                    }
                } else {
                    enqueueSnackbar('Failed to delete folder', {
                        variant: 'error',
                    });
                }
            },
        });
    };

    return (
        <TableRow data-folder-name={folder} sx={{ width: '100%' }}>
            <TableCell>{folder}</TableCell>
            <TableCell>{prettyBytes(freeSpace)}</TableCell>
            <TableCell align="right">
                <IconButton
                    color="error"
                    aria-label="delete"
                    onClick={handleDelete}
                    data-testid="delete-folder-button"
                >
                    <DeleteIcon />
                </IconButton>
            </TableCell>
        </TableRow>
    );
};

export default FolderRow;
