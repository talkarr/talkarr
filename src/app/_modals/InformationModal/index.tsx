'use client';

import { usePathname } from 'next/navigation';

import type { FC } from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useSnackbar } from 'notistack';

import InfoBox from '@/app/_modals/InformationModal/_components/InfoBox';

import { useApiStore } from '@/providers/api-store-provider';
import { useUiStore } from '@/providers/ui-store-provider';

import BaseModal from '@components/CustomModal';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

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
                <Grid container spacing={2}>
                    <InfoBox
                        primaryText={t(
                            'modals.informationModal.applicationVersion',
                        )}
                        secondaryText={
                            appInformation.appVersion || t('common.unknown')
                        }
                        href={
                            appInformation.appVersion ? versionHref : undefined
                        }
                    />
                    <InfoBox
                        primaryText={t('modals.informationModal.repository')}
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
                        primaryText={t('modals.informationModal.nodeVersion')}
                        secondaryText={
                            process.env.NEXT_PUBLIC_NODEJS_VERSION ||
                            t('common.unknown')
                        }
                    />
                    <InfoBox
                        primaryText={t('modals.informationModal.ytdlpVersion')}
                        secondaryText={appInformation.ytdlpVersion}
                    />
                </Grid>
            ) : (
                <Typography>{t('common.loading')}</Typography>
            )}
        </BaseModal>
    );
};

export default InformationModal;
