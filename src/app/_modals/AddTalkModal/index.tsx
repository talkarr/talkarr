'use client';

import { useRouter } from 'next/navigation';

import type { FC } from 'react';
import { useEffect, useMemo, useState } from 'react';

import moment from 'moment';
import { enqueueSnackbar } from 'notistack';

import { getConfig } from '@/app/_api/settings/mediamanagement';
import { addEvent } from '@/app/_api/talks/add';

import {
    formatVideoDuration,
    stripInvalidCharsForDataAttribute,
} from '@/utils/string';

import { yearOnlyFormat } from '@/constants';
import { useUiStore } from '@/providers/ui-store-provider';

import BaseModal from '@components/CustomModal';
import TalkImage from '@components/TalkImage';
import AddIcon from '@mui/icons-material/Add';
import { alpha, useTheme } from '@mui/material';
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
    const theme = useTheme();

    const [availableFolders, setAvailableFolders] = useState<string[]>([]);

    const [rootFolder, setRootFolder] = useState<string>('');

    const open = !!addTalkModal;

    const title = useMemo(() => {
        if (!addTalkModal) {
            return '';
        }

        const year = moment(addTalkModal.date).format(yearOnlyFormat);

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

    const formattedLength = useMemo(() => {
        if (!addTalkModal?.duration) {
            return '';
        }

        return formatVideoDuration(addTalkModal.duration);
    }, [addTalkModal?.duration]);

    return (
        <BaseModal
            open={open}
            onClose={close}
            title={title}
            moreWidth
            divider
            testID="add-talk-modal"
        >
            <Box
                mt={2}
                display="flex"
                justifyContent="center"
                gap={2}
                overflow="hidden"
                height="100%"
                sx={{
                    flexDirection: 'row',
                    [theme.breakpoints.down('md')]: {
                        flexDirection: 'column',
                    },
                }}
            >
                <Box
                    flex={1}
                    sx={{
                        maxWidth: '33%',
                        height: '100%',
                        [theme.breakpoints.down('md')]: {
                            maxWidth: '100%',
                        },
                    }}
                >
                    <TalkImage
                        data={addTalkModal || undefined}
                        maxWidth="100%"
                        height="auto"
                        maxHeight="fit-content"
                    />
                </Box>
                <Box
                    flex={1}
                    height="100%"
                    data-testid="add-talk-modal-inner"
                    data-add-modal-slug={addTalkModal?.slug}
                >
                    {addTalkModal?.description || addTalkModal?.subtitle ? (
                        <Typography
                            variant="body2"
                            mb={1}
                            height="100%"
                            p={1.2}
                            border={1}
                            borderColor={alpha(theme.palette.divider, 0.2)}
                            borderRadius={3}
                            bgcolor="background.default"
                            boxShadow={2}
                            sx={{
                                overflowY: 'auto',
                                maxHeight: 300,
                                [theme.breakpoints.down('md')]: {
                                    maxHeight: 'none',
                                },
                            }}
                        >
                            {addTalkModal?.description ||
                                addTalkModal?.subtitle}
                        </Typography>
                    ) : null}
                    <Box mb={2}>
                        <Typography variant="body1" fontWeight="bold">
                            Date:
                        </Typography>
                        <Typography variant="body1">
                            {moment(addTalkModal?.date).format('MMMM D, YYYY')}
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                            Duration:
                        </Typography>
                        <Typography variant="body1">
                            {formattedLength}
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
                        {addTalkModal?.tags.length ? (
                            <>
                                <Typography variant="body1" fontWeight="bold">
                                    Tags:
                                </Typography>
                                <Typography variant="body1">
                                    {addTalkModal?.tags.join(', ')}
                                </Typography>
                            </>
                        ) : null}
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
                                data-testid="root-folder-select"
                            >
                                {availableFolders.map(folder => (
                                    <MenuItem
                                        key={folder}
                                        value={folder}
                                        data-testid={`root-folder-${stripInvalidCharsForDataAttribute(folder)}`}
                                    >
                                        {folder}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                    <Box display="flex" justifyContent="flex-end">
                        <Button
                            onClick={close}
                            variant="text"
                            data-testid="cancel-button"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="text"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={handleAddTalk}
                            data-testid="add-talk-button"
                            data-selected-root-folder={stripInvalidCharsForDataAttribute(
                                rootFolder,
                            )}
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
