'use client';

import type { FC } from 'react';
import { useCallback, useEffect, useState } from 'react';

import { addFolder, listFiles } from '@/app/_api/settings/mediamanagement';

import { useUiStore } from '@/providers/uiStoreProvider';

import BaseModal from '@components/CustomModal';
import { alpha, styled } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';

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
    const addFolderModal = useUiStore(state => state.addFolderModal);
    const close = useUiStore(state => state.closeAddFolderModal);

    const [folders, setFolders] = useState<string[]>([]);

    const [folderName, setFolderName] = useState<string>('');

    const [separator, setSeparator] = useState<string>('');

    const [error, setError] = useState<string | null>(null);

    const [addFolderLoading, setAddFolderLoading] = useState<boolean>(false);

    const handleFetchFolders = async (folder: string): Promise<void> => {
        // Fetch folders from the server
        setError(null);

        try {
            const response = await listFiles({ folder });

            if (response) {
                if (response.success) {
                    setFolders(response.data.files);
                    setSeparator(response.data.separator);
                } else {
                    setError(response.error);
                }
            } else {
                setError('Error fetching folders');
            }
        } catch (e) {
            console.error('Error fetching folders', e);
            setError('Error fetching folders');
        }
    };

    const handleAddFolder = async (): Promise<void> => {
        setError(null);

        try {
            // Add folder to the server
            setAddFolderLoading(true);

            const response = await addFolder({ folder: folderName });

            if (response) {
                if (response.success) {
                    close();
                } else {
                    setError(response.error);
                }
            } else {
                setError('Error adding folder');
            }
        } catch (e) {
            console.error('Error adding folder', e);
            setError('Error adding folder');
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
        if (!folders.length) {
            handleFetchFolders(folderName);
        }
    }, [folderName, folders.length]);

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
        [separator, folderName],
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
    }, [separator, folderName]);

    return (
        <BaseModal
            open={addFolderModal}
            onClose={close}
            title="Add a root folder"
            moreWidth
            closeButtonDisabled={addFolderLoading}
        >
            <Box mb={2}>
                <form
                    onSubmit={e => {
                        e.preventDefault();
                        handleFetchFolders(folderName);
                    }}
                >
                    <TextField
                        label="Folder name"
                        variant="standard"
                        value={folderName}
                        onChange={e => setFolderName(e.target.value)}
                        fullWidth
                        helperText={error}
                        error={Boolean(error)}
                        disabled={addFolderLoading}
                    />
                </form>
            </Box>
            <Box mb={2}>
                <StyledList disablePadding>
                    {folders.length ? (
                        <ListItem disablePadding>
                            <ListItemButton
                                onClick={() => removeFolderSegment()}
                                disabled={addFolderLoading}
                            >
                                ..
                            </ListItemButton>
                        </ListItem>
                    ) : (
                        <ListItem>
                            <ListItemText>No folders found</ListItemText>
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
                    color="secondary"
                    onClick={close}
                    variant="contained"
                    disabled={addFolderLoading}
                >
                    Cancel
                </Button>
                <Button
                    color="primary"
                    onClick={handleAddFolder}
                    variant="contained"
                    disabled={addFolderLoading}
                >
                    Add
                </Button>
            </Box>
        </BaseModal>
    );
};

export default AddFolderModal;
