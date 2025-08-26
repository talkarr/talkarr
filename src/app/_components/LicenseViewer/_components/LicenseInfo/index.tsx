'use client';

import type { FC } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import OpenExternalIcon from '@mui/icons-material/OpenInNewRounded';

import { useUiStore } from '@/providers/ui-store-provider';

export interface LicenseInfoProps {
    maxHeight?: string;
}

const LicenseInfo: FC<LicenseInfoProps> = ({ maxHeight }) => {
    const { t } = useTranslation();
    const license = useUiStore(store => store.licenseSelected);

    const isValidUrl = useMemo(() => {
        if (!license?.repository) {
            return false;
        }

        try {
            // eslint-disable-next-line no-new
            new URL(license.repository || '');
            return true;
        } catch {
            return false;
        }
    }, [license?.repository]);

    if (!license) {
        return null;
    }

    return (
        <Paper
            sx={{
                flex: 2,
                p: 2,
                borderRadius: 4,
                maxHeight: maxHeight ?? `min(100%, 600px)`,
                display: 'flex',
                flexDirection: 'column',
                overflowY: 'auto',
            }}
        >
            <Box
                display="flex"
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
            >
                <Box display="flex" flexDirection="column">
                    <Typography variant="h4">{license.name}</Typography>
                    <Typography variant="subtitle1" color="textSecondary">
                        {license.version}
                    </Typography>
                </Box>
                <a
                    href={license.repository}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Button
                        startIcon={<OpenExternalIcon />}
                        color="primary"
                        disabled={!isValidUrl}
                    >
                        {t(
                            'pages.licenseSettingsPage.components.licenseInfo.moreInformation',
                        )}
                    </Button>
                </a>
            </Box>
            <Divider sx={{ mt: 2 }} />
            <Box mt={2} mb={2}>
                <Typography whiteSpace="pre-line">
                    {license.licenseContent}
                </Typography>
            </Box>
        </Paper>
    );
};

export default LicenseInfo;
