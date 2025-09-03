'use client';

import { useRouter } from 'next/navigation';

import type { FC } from 'react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Markdown from 'react-markdown';

import { alpha, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

import AddIcon from '@mui/icons-material/Add';

import { useSnackbar } from 'notistack';

import { getConfig } from '@/app/_api/settings/mediamanagement';
import { addEvent } from '@/app/_api/talks/add';

import { stripInvalidCharsForDataAttribute } from '@/utils/string';

import { yearOnlyFormat } from '@/constants';
import { useUiStore } from '@/providers/ui-store-provider';

import BaseModal from '@components/CustomModal';
import NoSsrMoment from '@components/NoSsrMoment';
import SearchItemBadges from '@components/SearchItemBadges';
import TalkImage from '@components/TalkImage';

const AddTalkModal: FC = () => {
    const { t } = useTranslation();
    const { enqueueSnackbar } = useSnackbar();

    const addTalkModal = useUiStore(state => state.addTalkModal);
    const close = useUiStore(state => state.closeAddTalkModal);
    const router = useRouter();
    const theme = useTheme();
    const [loading, setLoading] = useState<boolean>(false);

    const [availableFolders, setAvailableFolders] = useState<string[]>([]);

    const [rootFolder, setRootFolder] = useState<string>('');

    const open = !!addTalkModal;

    const handleAddTalk = async (): Promise<void> => {
        if (!addTalkModal?.guid) {
            return;
        }

        setLoading(true);

        try {
            const response = await addEvent({
                guid: addTalkModal.guid,
                root_folder: rootFolder,
            });

            setLoading(false);

            if (response) {
                if (response.success) {
                    enqueueSnackbar('Talk added successfully.', {
                        variant: 'success',
                    });
                    close();
                    setLoading(false);
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
        } catch (error) {
            setLoading(false);
            enqueueSnackbar(`Error adding talk: ${error}`, {
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
        <BaseModal
            open={open}
            onClose={close}
            title={
                <NoSsrMoment>
                    {moment => {
                        if (!addTalkModal) {
                            return '';
                        }

                        const year = moment(addTalkModal.date).format(
                            yearOnlyFormat,
                        );

                        return `${addTalkModal.title} (${year})`;
                    }}
                </NoSsrMoment>
            }
            moreWidth
            divider
            testID="add-talk-modal"
            disableClose={loading}
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
                    {addTalkModal?.description ? (
                        <Box
                            bgcolor="background.default"
                            p={1.2}
                            border={1}
                            borderColor={alpha(theme.palette.divider, 0.2)}
                            borderRadius={3}
                            boxShadow={2}
                            mb={2}
                            sx={{
                                overflowY: 'auto',
                                maxHeight: 300,
                                [theme.breakpoints.down('md')]: {
                                    maxHeight: 'none',
                                },
                            }}
                        >
                            <Markdown skipHtml>
                                {addTalkModal.description}
                            </Markdown>
                        </Box>
                    ) : null}
                    <Box mb={4}>
                        <SearchItemBadges item={addTalkModal} disableOnClick />
                    </Box>
                    <Box mb={2}>
                        <FormControl fullWidth>
                            <InputLabel id="root-folder-label">
                                {t('modals.addTalkModal.selectRootFolder')}
                            </InputLabel>
                            <Select
                                variant="outlined"
                                fullWidth
                                value={rootFolder}
                                onChange={e =>
                                    setRootFolder(e.target.value as string)
                                }
                                labelId="root-folder-label"
                                label={t(
                                    'modals.addTalkModal.selectRootFolder',
                                )}
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
                            disabled={loading}
                            variant="text"
                            data-testid="cancel-button"
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            variant="text"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={handleAddTalk}
                            loading={loading}
                            data-testid="add-talk-button"
                            data-selected-root-folder={stripInvalidCharsForDataAttribute(
                                rootFolder,
                            )}
                        >
                            {t('modals.addTalkModal.addTalkButtonText')}
                        </Button>
                    </Box>
                </Box>
            </Box>
        </BaseModal>
    );
};

export default AddTalkModal;
