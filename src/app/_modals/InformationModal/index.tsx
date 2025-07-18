'use client';

import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useSnackbar } from 'notistack';

import type { SuccessData } from '@backend/types';

import { getInformation } from '@/app/_api';
import InfoBox from '@/app/_modals/InformationModal/_components/InfoBox';

import { pageName } from '@/constants';
import { useUiStore } from '@/providers/uiStoreProvider';

import BaseModal from '@components/CustomModal';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

type AppInformation = SuccessData<'/information', 'get'>;

const InformationModal: FC = () => {
    const { enqueueSnackbar } = useSnackbar();
    const informationModalOpen = useUiStore(store => store.informationModal);
    const closeInformationModal = useUiStore(
        store => store.closeInformationModal,
    );
    const [appInformation, setAppInformation] = useState<AppInformation | null>(
        null,
    );

    const updateInformation = useCallback(async (): Promise<void> => {
        const result = await getInformation();

        if (!result?.success) {
            enqueueSnackbar('Failed to load application information', {
                variant: 'error',
            });
            return;
        }

        setAppInformation(result.data);
    }, [enqueueSnackbar]);

    useEffect(() => {
        if (informationModalOpen) {
            updateInformation();
        }
    }, [informationModalOpen, updateInformation]);

    const repoName = useMemo(() => {
        const repoUrl = process.env.NEXT_PUBLIC_REMOTE_URL; // might be https or ssh. directly extracted from git

        if (!repoUrl?.includes('github.com')) {
            return 'unknown repo';
        }

        const regex = /github\.com[:/](.+?)(?:\.git)?$/;
        const match = repoUrl.match(regex);

        if (!match || match.length < 2) {
            return 'unknown repo';
        }

        const repoPath = match[1];
        const parts = repoPath.split('/');
        if (parts.length < 2) {
            return 'unknown repo';
        }

        return `${parts[0]}/${parts[1]}`;
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
            return undefined;
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
                        href={githubActionsRunIdHref}
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
