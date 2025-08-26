'use client';

import { usePathname } from 'next/navigation';

import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import BugIcon from '@mui/icons-material/BugReport';
import CheckmarkIcon from '@mui/icons-material/Check';
import CopyIcon from '@mui/icons-material/CopyAll';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { useSnackbar } from 'notistack';

import InfoBox from '@/app/_modals/InformationModal/_components/InfoBox';

import { useApiStore } from '@/providers/api-store-provider';
import { useUiStore } from '@/providers/ui-store-provider';

import BaseModal from '@components/CustomModal';

const InformationModal: FC = () => {
    const { t } = useTranslation();

    const pathname = usePathname();
    const { enqueueSnackbar } = useSnackbar();
    const informationModalOpen = useUiStore(store => store.informationModal);
    const closeInformationModal = useUiStore(
        store => store.closeInformationModal,
    );

    const showVersionChangedModal = useUiStore(
        store => store.showVersionChangedModal,
    );

    const appInformation = useApiStore(store => store.appInformation);
    const getAppInformationData = useApiStore(
        store => store.getAppInformationData,
    );

    const [copySuccess, setCopySuccess] = useState<boolean>(false);

    const updateInformation = useCallback(async (): Promise<void> => {
        const result = await getAppInformationData({
            onVersionChange: () => {
                closeInformationModal();
                showVersionChangedModal();
            },
        });

        if (!result?.success) {
            enqueueSnackbar(t('modals.informationModal.failedToLoadInfo'), {
                variant: 'error',
            });
            return;
        }
    }, [
        t,
        closeInformationModal,
        enqueueSnackbar,
        getAppInformationData,
        showVersionChangedModal,
    ]);

    useEffect(() => {
        if (pathname) {
            getAppInformationData({
                onVersionChange: () => {
                    closeInformationModal();
                    showVersionChangedModal();
                },
            });
        }
    }, [
        getAppInformationData,
        showVersionChangedModal,
        closeInformationModal,
        pathname,
    ]);

    useEffect(() => {
        if (informationModalOpen) {
            updateInformation();
        }
    }, [informationModalOpen, updateInformation]);

    const repoName = useMemo(() => {
        const repoUrl = process.env.NEXT_PUBLIC_REMOTE_URL; // might be https or ssh. directly extracted from git

        if (!repoUrl) {
            return t('modals.informationModal.unknownRepo');
        }

        // Handle HTTPS/HTTP URLs
        try {
            const urlObj = new URL(repoUrl);
            if (urlObj.hostname !== 'github.com') {
                return t('modals.informationModal.unknownRepo');
            }
            // Extract the repo path from pathname
            // pathname: /user/repo(.git)
            const pathMatch = urlObj.pathname.match(
                /^\/([^/]+)\/([^/.]+)(?:\.git)?$/,
            );
            if (!pathMatch) return t('modals.informationModal.unknownRepo');
            return `${pathMatch[1]}/${pathMatch[2]}`;
        } catch {
            // Not a valid URL, could be an SSH URL
            // SSH format: git@github.com:user/repo.git
            const sshRegex = /^git@github\.com:(.+?)(?:\.git)?$/;
            const match = repoUrl.match(sshRegex);
            if (match) {
                return match[1];
            }
            return t('modals.informationModal.unknownRepo');
        }
    }, [t]);

    const repoHref = `https://github.com/${repoName}`;

    const versionHref = useMemo(() => {
        const version = appInformation?.appVersion || t('common.unknown');

        const versionLooksLikeVersion =
            version.startsWith('v') || version.startsWith('V');

        if (!versionLooksLikeVersion) {
            return `${repoHref}/commit/${version}`;
        }

        return `${repoHref}/releases/tag/${appInformation?.appVersion || t('common.unknown')}`;
    }, [t, repoHref, appInformation?.appVersion]);

    const githubActionsRunIdHref = useMemo(() => {
        const runId = process.env.NEXT_PUBLIC_GITHUB_ACTIONS_RUN_ID;

        if (!runId) {
            return null;
        }

        return `${repoHref}/actions/runs/${runId}`;
    }, [repoHref]);

    const handleCopyInformation = useCallback(async (): Promise<void> => {
        const info = {
            appVersion: appInformation?.appVersion || 'unknown',
            isNightly: appInformation?.isNightly || false,
            ytdlpVersion: appInformation?.ytdlpVersion || 'unknown',
            repository: repoName,
            buildId: process.env.NEXT_PUBLIC_GITHUB_ACTIONS_RUN_ID || 'unknown',
            nodeVersion: process.env.NEXT_PUBLIC_NODEJS_VERSION || 'unknown',
        };

        try {
            await navigator.clipboard.writeText(JSON.stringify(info, null, 4));
            enqueueSnackbar(t('modals.informationModal.copiedToClipboard'), {
                variant: 'success',
            });
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch {
            enqueueSnackbar(t('modals.informationModal.failedToCopy'), {
                variant: 'error',
            });
            return;
        }
    }, [
        appInformation?.appVersion,
        appInformation?.isNightly,
        appInformation?.ytdlpVersion,
        enqueueSnackbar,
        repoName,
        t,
    ]);

    const openIssues = useCallback((): void => {
        window.open(`${repoHref}/issues`, '_blank', 'noopener,noreferrer');
    }, [repoHref]);

    return (
        <BaseModal
            open={informationModalOpen}
            onClose={closeInformationModal}
            testID="information-modal"
            title={t('modals.informationModal.title')}
            showCloseButton
            moreMobileWidth
        >
            {appInformation ? (
                <>
                    <Grid container spacing={2}>
                        <InfoBox
                            primaryText={t(
                                'modals.informationModal.applicationVersion',
                            )}
                            secondaryText={
                                appInformation.appVersion
                                    ? `${appInformation.appVersion} (${appInformation.isNightly ? 'Nightly' : 'Release'})`
                                    : t('common.unknown')
                            }
                            href={
                                appInformation.appVersion
                                    ? versionHref
                                    : undefined
                            }
                        />
                        <InfoBox
                            primaryText={t(
                                'modals.informationModal.repository',
                            )}
                            secondaryText={repoName}
                            href={repoHref}
                        />
                        <InfoBox
                            primaryText={t('modals.informationModal.buildId')}
                            secondaryText={
                                process.env.NEXT_PUBLIC_GITHUB_ACTIONS_RUN_ID ||
                                t(
                                    'modals.informationModal.notBuildWithGithubActions',
                                )
                            }
                            href={githubActionsRunIdHref || undefined}
                        />
                        <InfoBox
                            primaryText={t(
                                'modals.informationModal.nodeVersion',
                            )}
                            secondaryText={
                                process.env.NEXT_PUBLIC_NODEJS_VERSION ||
                                t('common.unknown')
                            }
                        />
                        <InfoBox
                            primaryText={t(
                                'modals.informationModal.ytdlpVersion',
                            )}
                            secondaryText={appInformation.ytdlpVersion}
                        />
                    </Grid>
                    <Box
                        mt={2}
                        display="flex"
                        justifyContent="flex-end"
                        gap={1}
                    >
                        <Button
                            variant="outlined"
                            startIcon={<BugIcon />}
                            onClick={openIssues}
                            data-testid="open-issues-button"
                            size="small"
                        >
                            {t('modals.informationModal.openIssues')}
                        </Button>
                        <Button
                            variant="outlined"
                            color="primary"
                            startIcon={
                                copySuccess ? <CheckmarkIcon /> : <CopyIcon />
                            }
                            onClick={handleCopyInformation}
                            data-testid="copy-information-button"
                            size="small"
                        >
                            {t('modals.informationModal.copyToClipboard')}
                        </Button>
                    </Box>
                </>
            ) : (
                <Typography>{t('common.loading')}</Typography>
            )}
        </BaseModal>
    );
};

export default InformationModal;
