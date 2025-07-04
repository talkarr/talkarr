'use client';

import type { FC } from 'react';
import React, { useState } from 'react';

import { useSnackbar } from 'notistack';

import {
    getGeneralSettings,
    setGeneralSettings,
} from '@/app/_api/settings/general';
import type { GeneralSettings } from '@/app/(globalModals)/settings/general/page';

import SettingsItem from '@components/SettingsItem';
import AvatarIcon from '@mui/icons-material/AccountCircle';
import SaveIcon from '@mui/icons-material/SaveRounded';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

export interface GeneralSettingsFormProps {
    initialData: GeneralSettings;
}

const GeneralSettingsForm: FC<GeneralSettingsFormProps> = ({ initialData }) => {
    const [settings, internalSetSettings] =
        useState<GeneralSettings>(initialData);
    const [wasChanged, setWasChanged] = useState<boolean>(false);

    const { enqueueSnackbar } = useSnackbar();

    const setSettings = (newSettings: GeneralSettings): void => {
        internalSetSettings(newSettings);
        setWasChanged(true);
    };

    const handleSubmit = async (event: React.FormEvent): Promise<void> => {
        event.preventDefault();

        if (!wasChanged) {
            return;
        }

        console.log('Submitting settings:', settings);

        try {
            const response = await setGeneralSettings(settings);

            if (!response?.success) {
                console.error('Failed to set settings:', response);
                enqueueSnackbar('Failed to save settings', {
                    variant: 'error',
                });
                return;
            }

            enqueueSnackbar('Settings saved successfully', {
                variant: 'success',
                preventDuplicate: true,
            });

            const updatedSettings = await getGeneralSettings();

            if (updatedSettings?.success) {
                internalSetSettings(updatedSettings.data);
                setWasChanged(false);
            } else {
                console.error('Failed to update settings');
                enqueueSnackbar('Failed to update settings', {
                    variant: 'error',
                });
            }
        } catch (error) {
            console.error('Error updating settings:', error);

            enqueueSnackbar('Error updating settings', {
                variant: 'error',
            });
        }
    };

    return (
        <Container sx={{ ml: 0 }} maxWidth="md" disableGutters>
            <Box
                mb={2}
                display="flex"
                flexDirection="row"
                justifyContent="space-between"
                alignItems="flex-start"
            >
                <Typography variant="h4">General</Typography>
                <IconButton
                    onClick={handleSubmit}
                    disabled={!wasChanged}
                    color="primary"
                >
                    <SaveIcon />
                </IconButton>
            </Box>
            <form onSubmit={handleSubmit}>
                <Box mb={2}>
                    <Typography variant="h6">External Services</Typography>
                </Box>
                <Box>
                    <SettingsItem
                        icon={<AvatarIcon />}
                        primaryText="Allow Libravatar"
                        secondaryText="This will enable fetching avatars via the account email."
                        onClick={() => {
                            setSettings({
                                ...settings,
                                allowLibravatar: !settings.allowLibravatar,
                            });
                        }}
                    >
                        {onClick => (
                            <Switch
                                onChange={onClick}
                                checked={settings.allowLibravatar}
                            />
                        )}
                    </SettingsItem>
                </Box>
            </form>
        </Container>
    );
};

export default GeneralSettingsForm;
