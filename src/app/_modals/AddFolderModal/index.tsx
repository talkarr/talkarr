'use client';

import type { FC } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import AddIcon from '@mui/icons-material/Add';

import { alpha, styled } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';

import { useSnackbar } from 'notistack';

import { addFolder, listFiles } from '@/app/_api/settings/mediamanagement';

import { useUiStore } from '@/providers/ui-store-provider';

import BaseModal from '@components/CustomModal';

const StyledList = styled(List)(({ theme }) => ({
    width: '100%',
    backgroundColor: theme.palette.background.default,
    position: 'relative',
    overflow: 'auto',
    maxHeight: 300,
    borderRadius: theme.shape.borderRadius * 2,

    '& .MuiListItem-root': {
        '&:not(:last-child)': {
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
        },
    },
}));

const AddFolderModal: FC = () => {
    const { t } = useTranslation();
    const { enqueueSnackbar } = useSnackbar();

    const addFolderModal = useUiStore(state => state.addFolderModal);
    const close = useUiStore(state => state.closeAddFolderModal);

    const listRef = useRef<HTMLUListElement | null>(null);

    const [folders, setFolders] = useState<string[]>([]);

    const [folderName, setFolderName] = useState<string>('');

    const [separator, setSeparator] = useState<string>('');

    const [error, setError] = useState<string | null>(null);

    const [addFolderLoading, setAddFolderLoading] = useState<boolean>(false);

    const handleFetchFolders = useCallback(
        async (folder: string): Promise<void> => {
            // Fetch folders from the server
            setError(null);

            try {
                const response = await listFiles({ folder });

                if (response) {
                    if (response.success) {
                        setFolders(response.data.files);
                        setSeparator(response.data.separator);

                        if (listRef.current) {
                            listRef.current.scrollTop = 0;
                        }
                    } else {
                        setError(response.error);
                    }
                } else {
                    setError(
                        t('modals.addFolderModal.errorFetchingRootFolders'),
                    );
                }
            } catch (error_) {
                console.error('Error fetching folders', error_);
                setError(t('modals.addFolderModal.errorFetchingRootFolders'));
            }
        },
        [t],
    );

    const handleAddFolder = async (): Promise<void> => {
        setError(null);

        try {
            // Add folder to the server
            setAddFolderLoading(true);

            const response = await addFolder({ folder: folderName });

            if (response) {
                if (response.success) {
                    enqueueSnackbar(
                        t('modals.addFolderModal.folderAddedSuccessfully'),
                        {
                            variant: 'success',
                        },
                    );
                    close();
                } else {
                    setError(response.error);
                }
            } else {
                setError(t('modals.addFolderModal.folderAddFailed'));
            }
        } catch (error_) {
            console.error('Error adding folder', error_);
            setError(t('modals.addFolderModal.folderAddFailed'));
        }

        setAddFolderLoading(false);
    };

    useEffect(() => {
        if (!folderName && separator === '/') {
            setFolderName('/');
        }
    }, [folderName, separator]);

    useEffect(() => {
        // if opened and no folders, fetch root folders
        if (folders.length === 0) {
            handleFetchFolders(folderName);
        }
    }, [folderName, folders.length, handleFetchFolders]);

    const handleAppendFolderPath = useCallback(
        (folder: string): void => {
            if (!separator) {
                return;
            }

            const actualSeparator = folderName.endsWith(separator)
                ? ''
                : separator;

            const newFolderName = `${folderName}${actualSeparator}${folder}`;
            setFolderName(newFolderName);
            handleFetchFolders(newFolderName);
        },
        [separator, folderName, handleFetchFolders],
    );

    const removeFolderSegment = useCallback((): void => {
        if (!separator) {
            return;
        }

        const folderSegments = folderName.split(separator);
        folderSegments.pop();
        const newFolderName = folderSegments.join(separator) || '/';
        setFolderName(newFolderName);
        handleFetchFolders(newFolderName);
    }, [separator, folderName, handleFetchFolders]);

    return (
        <BaseModal
            open={addFolderModal}
            onClose={close}
            title={t('modals.addFolderModal.title')}
            moreWidth
            testID="add-folder-modal"
        >
            <Box mb={2}>
                <form
                    onSubmit={e => {
                        e.preventDefault();
                        handleFetchFolders(folderName);
                    }}
                >
                    <TextField
                        label={t('modals.addFolderModal.rootFolderName')}
                        variant="standard"
                        value={folderName}
                        onChange={e => setFolderName(e.target.value)}
                        fullWidth
                        helperText={error}
                        error={Boolean(error)}
                        disabled={addFolderLoading}
                        slotProps={{
                            htmlInput: {
                                'data-testid': 'add-folder-input',
                            },
                            formHelperText: {
                                'data-testid': 'add-folder-helper-text',
                            },
                        }}
                    />
                </form>
            </Box>
            <Box mb={2}>
                <StyledList disablePadding ref={listRef}>
                    {folders.length > 0 ? (
                        <ListItem disablePadding>
                            <ListItemButton
                                // previous folder
                                onClick={() => removeFolderSegment()}
                                disabled={addFolderLoading}
                            >
                                ..
                            </ListItemButton>
                        </ListItem>
                    ) : (
                        <ListItem>
                            <ListItemText>
                                {t('modals.addFolderModal.noRootFoldersFound')}
                            </ListItemText>
                        </ListItem>
                    )}
                    {folders.map(folder => (
                        <ListItem key={folder} disablePadding>
                            <ListItemButton
                                onClick={() => handleAppendFolderPath(folder)}
                                disabled={addFolderLoading}
                            >
                                {folder}
                            </ListItemButton>
                        </ListItem>
                    ))}
                </StyledList>
            </Box>
            <Box display="flex" justifyContent="flex-end" gap={1}>
                <Button
                    onClick={close}
                    variant="text"
                    disabled={addFolderLoading}
                >
                    {t('modals.addFolderModal.cancel')}
                </Button>
                <Button
                    onClick={handleAddFolder}
                    variant="text"
                    disabled={addFolderLoading}
                    data-testid="add-folder-button"
                    endIcon={
                        addFolderLoading ? (
                            <CircularProgress
                                size={20}
                                color="inherit"
                                data-testid="add-folder-loading"
                            />
                        ) : null
                    }
                    startIcon={<AddIcon />}
                >
                    {t('modals.addFolderModal.addFolder')}
                </Button>
            </Box>
        </BaseModal>
    );
};

export default AddFolderModal;
