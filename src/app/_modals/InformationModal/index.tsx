'use client';

import { usePathname } from 'next/navigation';

import type { FC } from 'react';
import { useCallback, useEffect, useMemo } from 'react';

import { useSnackbar } from 'notistack';

import InfoBox from '@/app/_modals/InformationModal/_components/InfoBox';

import { pageName } from '@/constants';
import { useApiStore } from '@/providers/api-store-provider';
import { useUiStore } from '@/providers/ui-store-provider';

import BaseModal from '@components/CustomModal';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

const InformationModal: FC = () => {
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
            enqueueSnackbar('Failed to load application information', {
                variant: 'error',
            });
            return;
        }
    }, [
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
            return 'unknown repo';
        }

        // Handle HTTPS/HTTP URLs
        try {
            const urlObj = new URL(repoUrl);
            if (urlObj.hostname !== 'github.com') {
                return 'unknown repo';
            }
            // Extract the repo path from pathname
            // pathname: /user/repo(.git)
            const pathMatch = urlObj.pathname.match(
                /^\/([^/]+)\/([^/.]+)(?:\.git)?$/,
            );
            if (!pathMatch) return 'unknown repo';
            return `${pathMatch[1]}/${pathMatch[2]}`;
        } catch {
            // Not a valid URL, could be an SSH URL
            // SSH format: git@github.com:user/repo.git
            const sshRegex = /^git@github\.com:(.+?)(?:\.git)?$/;
            const match = repoUrl.match(sshRegex);
            if (match) {
                return match[1];
            }
            return 'unknown repo';
        }
    }, []);

    const repoHref = `https://github.com/${repoName}`;

    const versionHref = useMemo(() => {
        const version = process.env.NEXT_PUBLIC_CURRENT_VERSION || 'unknown';

        const versionLooksLikeVersion =
            version.startsWith('v') || version.startsWith('V');

        if (!versionLooksLikeVersion) {
            return `${repoHref}/commit/${version}`;
        }

        return `${repoHref}/releases/tag/${process.env.NEXT_PUBLIC_CURRENT_VERSION || 'unknown'}`;
    }, [repoHref]);

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
            title="Informations about the application"
            showCloseButton
            moreMobileWidth
        >
            {appInformation ? (
                <Grid container spacing={2}>
                    <InfoBox
                        primaryText={`${pageName} version`}
                        secondaryText={
                            process.env.NEXT_PUBLIC_CURRENT_VERSION || 'unknown'
                        }
                        href={versionHref}
                    />
                    <InfoBox
                        primaryText="Repository"
                        secondaryText={repoName}
                        href={repoHref}
                    />
                    <InfoBox
                        primaryText="Build"
                        secondaryText={
                            process.env.NEXT_PUBLIC_GITHUB_ACTIONS_RUN_ID ||
                            'Not built with GitHub Actions'
                        }
                        href={githubActionsRunIdHref || undefined}
                    />
                    <InfoBox
                        primaryText="Node.js version"
                        secondaryText={
                            process.env.NEXT_PUBLIC_NODEJS_VERSION || 'unknown'
                        }
                    />
                    <InfoBox
                        primaryText="ytdlp version"
                        secondaryText={appInformation.ytdlpVersion}
                    />
                </Grid>
            ) : (
                <Typography>Loading information...</Typography>
            )}
        </BaseModal>
    );
};

export default InformationModal;
