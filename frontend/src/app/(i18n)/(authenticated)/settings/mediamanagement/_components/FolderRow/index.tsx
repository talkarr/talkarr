'use client';

import { useRouter } from 'next/navigation';

import type { FC } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import IconButton from '@mui/material/IconButton';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

import DeleteIcon from '@mui/icons-material/Delete';
import ErrorIcon from '@mui/icons-material/Error';

import { useSnackbar } from 'notistack';
import prettyBytes from 'pretty-bytes';

import type { SuccessData } from '@backend/types';

import { removeFolder } from '@/app/_api/settings/mediamanagement';

import { useUiStore } from '@/providers/ui-store-provider';

import FancyIconButton from '@components/FancyIconButton';

export interface FolderRowProps {
    folderData: SuccessData<
        '/settings/mediamanagement/info',
        'get'
    >['folders'][number];
}

const FolderRow: FC<FolderRowProps> = ({ folderData }) => {
    const {
        folder,
        did_not_find_mark: didNotFindMark,
        free_space: freeSpace,
    } = folderData;

    const { t } = useTranslation();
    const { enqueueSnackbar } = useSnackbar();

    const showConfirmDelete = useUiStore(state => state.showConfirmationModal);
    const openRootFolderErrorModal = useUiStore(
        state => state.openRootFolderErrorModal,
    );
    const router = useRouter();

    const handleDelete = (): void => {
        showConfirmDelete({
            title: t(
                'settings.mediaManagementSettingsPage.components.folderRow.deleteModal.title',
            ),
            message: t(
                'settings.mediaManagementSettingsPage.components.folderRow.deleteModal.message',
                {
                    folderName: folder,
                },
            ),
            confirmColor: 'error',
            onConfirm: async () => {
                const response = await removeFolder({ folder });

                if (response) {
                    if (response.success) {
                        router.refresh();
                        enqueueSnackbar(
                            t(
                                'settings.mediaManagementSettingsPage.components.folderRow.deleteModal.onSuccess',
                            ),
                            {
                                variant: 'success',
                            },
                        );
                    } else {
                        enqueueSnackbar(
                            t(
                                'settings.mediaManagementSettingsPage.components.folderRow.deleteModal.onErrorMessage',
                                {
                                    error:
                                        response.error ||
                                        t('errors.unknownError'),
                                },
                            ),
                            { variant: 'error' },
                        );
                    }
                } else {
                    enqueueSnackbar(
                        t(
                            'settings.mediaManagementSettingsPage.components.folderRow.deleteModal.onError',
                        ),
                        {
                            variant: 'error',
                        },
                    );
                }
            },
        });
    };

    const hasError = useMemo(() => didNotFindMark, [didNotFindMark]);

    return (
        <TableRow data-folder-name={folder} sx={{ width: '100%' }}>
            <TableCell>
                {hasError ? (
                    <FancyIconButton
                        color="error"
                        onClick={() => openRootFolderErrorModal({ folderData })}
                    >
                        <ErrorIcon />
                    </FancyIconButton>
                ) : null}
            </TableCell>
            <TableCell>{folder}</TableCell>
            <TableCell>{prettyBytes(freeSpace)}</TableCell>
            <TableCell align="right">
                <IconButton
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
