'use client';

import { useRouter } from 'next/navigation';

import type { FC } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';

import { useSnackbar } from 'notistack';

import type { SuccessData } from '@backend/types';

import { rootFolderFix } from '@/app/_api/settings/mediamanagement';

import { useUiStore } from '@/providers/ui-store-provider';

import BaseModal from '@components/CustomModal';

export interface RootFolderErrorModalData {
    folderData: SuccessData<
        '/settings/mediamanagement/info',
        'get'
    >['folders'][number];
}

const RootFolderErrorModal: FC = () => {
    const router = useRouter();
    const { t } = useTranslation();

    const rootFolderErrorModal = useUiStore(
        state => state.rootFolderErrorModal,
    );
    const closeModal = useUiStore(state => state.closeRootFolderErrorModal);

    const handleCloseModal = async (): Promise<void> => {
        router.refresh();
        closeModal();
    };

    const open = !!rootFolderErrorModal;

    const [loading, setLoading] = useState<boolean>(false);
    const { enqueueSnackbar } = useSnackbar();

    const enableForceMark = useMemo(() => {
        if (!rootFolderErrorModal?.folderData) {
            return false;
        }

        const { marked, did_not_find_mark: didNotFindMark } =
            rootFolderErrorModal.folderData;

        return marked && didNotFindMark;
    }, [rootFolderErrorModal?.folderData]);

    const handleForceMark = async (): Promise<void> => {
        if (loading || !rootFolderErrorModal?.folderData) {
            return;
        }

        try {
            setLoading(true);
            const response = await rootFolderFix({
                path: rootFolderErrorModal.folderData.folder,
                fix_type: 'force_mark',
            });

            if (!response?.success) {
                enqueueSnackbar({
                    message:
                        response?.error ||
                        t('modals.rootFolderErrorModal.failedToForceMark'),
                    variant: 'error',
                });
                setLoading(false);
                return;
            }

            enqueueSnackbar({
                message: t('modals.rootFolderErrorModal.rootFolderMarkSuccess'),
                variant: 'success',
            });

            handleCloseModal();
        } catch (error) {
            console.error('Error forcing root folder mark:', error);
            enqueueSnackbar({
                message: t('modals.rootFolderErrorModal.failedToForceMark'),
                variant: 'error',
            });
        }

        setLoading(false);
    };

    useEffect(() => {
        window.onbeforeunload = loading ? () => true : null;
    }, [loading]);

    return (
        <BaseModal
            open={open}
            onClose={handleCloseModal}
            title={t('modals.rootFolderErrorModal.title')}
            testID="root-folder-error-modal"
            showCloseButton
            disableClose={loading}
        >
            <Box>
                {enableForceMark ? (
                    <Paper
                        sx={{
                            p: 2,
                            borderRadius: 4,
                            boxShadow: 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                        }}
                    >
                        <Box
                            display="flex"
                            flexDirection="row"
                            gap={1}
                            alignItems="center"
                        >
                            <ErrorIcon color="error" />
                            <Typography variant="h6">
                                {t(
                                    'modals.rootFolderErrorModal.rootFolderMarkNotFound',
                                )}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="body1">
                                {t(
                                    'modals.rootFolderErrorModal.rootFolderMarkNotFoundDescription',
                                )}
                            </Typography>
                        </Box>
                        <Box
                            display="flex"
                            flexDirection="row"
                            justifyContent="flex-end"
                            mt={1}
                        >
                            <Button
                                variant="contained"
                                color="error"
                                size="small"
                                onClick={handleForceMark}
                                loading={loading}
                                startIcon={<WarningIcon />}
                            >
                                {t(
                                    'modals.rootFolderErrorModal.forceMarkButton',
                                )}
                            </Button>
                        </Box>
                    </Paper>
                ) : null}
            </Box>
        </BaseModal>
    );
};

export default RootFolderErrorModal;
