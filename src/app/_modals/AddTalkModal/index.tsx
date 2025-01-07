'use client';

import { useRouter } from 'next/navigation';

import type { FC } from 'react';
import { useEffect, useMemo, useState } from 'react';

import moment from 'moment';
import { enqueueSnackbar } from 'notistack';

import { getConfig } from '@/app/_api/settings/mediamanagement';
import { addEvent } from '@/app/_api/talks/add';

import { useUiStore } from '@/providers/uiStoreProvider';

import BaseModal from '@components/CustomModal';
import TalkImage from '@components/TalkImage';
import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';

const AddTalkModal: FC = () => {
    const addTalkModal = useUiStore(state => state.addTalkModal);
    const close = useUiStore(state => state.closeAddTalkModal);
    const router = useRouter();

    const [availableFolders, setAvailableFolders] = useState<string[]>([]);

    const [rootFolder, setRootFolder] = useState<string>('');

    const open = !!addTalkModal;

    const title = useMemo(() => {
        if (!addTalkModal) {
            return '';
        }

        const year = moment(addTalkModal.date).format('YYYY');

        return `${addTalkModal.title} (${year})`;
    }, [addTalkModal]);

    const handleAddTalk = async (): Promise<void> => {
        if (!addTalkModal?.guid) {
            return;
        }

        const response = await addEvent({
            guid: addTalkModal.guid,
            root_folder: rootFolder,
        });

        if (response) {
            if (response.success) {
                enqueueSnackbar('Talk added successfully.', {
                    variant: 'success',
                });
                close();
                router.refresh();
            } else {
                enqueueSnackbar(`Error adding talk: ${response.error}`, {
                    variant: 'error',
                });
            }
        } else {
            enqueueSnackbar('Error adding talk.', {
                variant: 'error',
            });
        }
    };

    useEffect(() => {
        const func = async (): Promise<void> => {
            const config = await getConfig();

            const data = config?.success ? config.data : null;

            if (data) {
                setAvailableFolders(data.folders.map(f => f.folder));
                if (data.folders.length > 0) {
                    setRootFolder(data.folders[0].folder);
                }
            }
        };

        if (open) {
            func();
        }
    }, [open]);

    return (
        <BaseModal open={open} onClose={close} title={title} moreWidth divider>
            <Box
                display="flex"
                flexDirection="row"
                justifyContent="center"
                gap={2}
            >
                <Box flex={1} maxWidth="33%">
                    <TalkImage
                        data={addTalkModal || undefined}
                        maxWidth="100%"
                    />
                </Box>
                <Box flex={1}>
                    <Typography variant="body2" mb={1}>
                        {addTalkModal?.description}
                    </Typography>
                    <Box mb={2}>
                        <Typography variant="body1" fontWeight="bold">
                            Date:
                        </Typography>
                        <Typography variant="body1">
                            {moment(addTalkModal?.date).format('MMMM D, YYYY')}
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                            Conference:
                        </Typography>
                        <Typography variant="body1">
                            {addTalkModal?.conference_title}{' '}
                            {addTalkModal?.conference_data?.link ? (
                                <>
                                    (
                                    <a
                                        href={
                                            addTalkModal?.conference_data?.link
                                        }
                                        target="_blank"
                                    >
                                        {addTalkModal?.conference_data?.link}
                                    </a>
                                    )
                                </>
                            ) : null}
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                            {addTalkModal?.persons?.length === 1
                                ? 'Speaker'
                                : 'Speakers'}
                            :
                        </Typography>
                        <Typography variant="body1">
                            {addTalkModal?.persons.join(', ')}
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                            Original language:
                        </Typography>
                        <Typography variant="body1">
                            {addTalkModal?.original_language}
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                            Tags:
                        </Typography>
                        <Typography variant="body1">
                            {addTalkModal?.tags.join(', ')}
                        </Typography>
                    </Box>
                    <Box mb={2}>
                        <FormControl fullWidth>
                            <InputLabel id="root-folder-label">
                                Root folder
                            </InputLabel>
                            <Select
                                variant="outlined"
                                fullWidth
                                value={rootFolder}
                                onChange={e =>
                                    setRootFolder(e.target.value as string)
                                }
                                labelId="root-folder-label"
                                label="Root folder"
                            >
                                {availableFolders.map(folder => (
                                    <MenuItem key={folder} value={folder}>
                                        {folder}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                    <Box display="flex" justifyContent="flex-end">
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={handleAddTalk}
                        >
                            Add talk
                        </Button>
                    </Box>
                </Box>
            </Box>
        </BaseModal>
    );
};

export default AddTalkModal;
