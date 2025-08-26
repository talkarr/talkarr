'use client';

import type { FC } from 'react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import AvatarIcon from '@mui/icons-material/AccountCircle';
import SaveIcon from '@mui/icons-material/SaveRounded';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

import { useSnackbar } from 'notistack';

import { ImportIsRecordedFlagBehavior } from '@backend/types/settings';

import {
    getGeneralSettings,
    setGeneralSettings,
} from '@/app/_api/settings/general';
import type { GeneralSettings } from '@/app/(i18n)/(authenticated)/settings/general/page';

import SettingsEnumDescriptions from '@components/SettingsEnumDescriptions';
import SettingsEnumItem from '@components/SettingsEnumItem';
import SettingsSwitchItem from '@components/SettingsSwitchItem';

export interface GeneralSettingsFormProps {
    initialData: GeneralSettings;
}

const GeneralSettingsForm: FC<GeneralSettingsFormProps> = ({ initialData }) => {
    const { t } = useTranslation();

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

        try {
            const response = await setGeneralSettings(settings);

            if (!response?.success) {
                console.error('Failed to set settings:', response);
                enqueueSnackbar(t('messages.settingsSaveFailed'), {
                    variant: 'error',
                });
                return;
            }

            enqueueSnackbar(t('messages.settingsSaveSuccess'), {
                variant: 'success',
                preventDuplicate: true,
            });

            const updatedSettings = await getGeneralSettings();

            if (updatedSettings?.success) {
                internalSetSettings(updatedSettings.data);
                setWasChanged(false);
            } else {
                console.error(
                    'Failed to update settings',
                    updatedSettings?.error,
                );
                enqueueSnackbar(t('messages.settingsSaveFailed'), {
                    variant: 'error',
                });
            }
        } catch (error) {
            console.error('Error updating settings:', error);

            enqueueSnackbar(t('messages.settingsSaveFailed'), {
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
                <Typography variant="h4">
                    {t('pages.generalSettingsPage.title')}
                </Typography>
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
                    <Typography variant="h6">
                        {t(
                            'pages.generalSettingsPage.components.generalSettingsForm.functionalityControl.title',
                        )}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        {t(
                            'pages.generalSettingsPage.components.generalSettingsForm.functionalityControl.description',
                        )}
                    </Typography>
                </Box>
                <Box mb={4}>
                    <SettingsEnumItem
                        primaryText={t(
                            'pages.generalSettingsPage.components.generalSettingsForm.functionalityControl.isRecordedFlagBehavior.primaryText',
                        )}
                        secondaryText={t(
                            'pages.generalSettingsPage.components.generalSettingsForm.functionalityControl.isRecordedFlagBehavior.secondaryText',
                        )}
                        options={ImportIsRecordedFlagBehavior}
                        value={settings.importIsRecordedFlagBehavior}
                        onChange={value => {
                            setSettings({
                                ...settings,
                                importIsRecordedFlagBehavior:
                                    value as ImportIsRecordedFlagBehavior,
                            });
                        }}
                        translatePrefix="importIsRecordedFlagBehavior"
                    />
                    <Box mt={1}>
                        <SettingsEnumDescriptions
                            options={ImportIsRecordedFlagBehavior}
                            translatePrefix="importIsRecordedFlagBehavior"
                        />
                    </Box>
                </Box>
                <Box mb={2}>
                    <Typography variant="h6">
                        {t(
                            'pages.generalSettingsPage.components.generalSettingsForm.externalServices.title',
                        )}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        {t(
                            'pages.generalSettingsPage.components.generalSettingsForm.externalServices.description',
                        )}
                    </Typography>
                </Box>
                <Box>
                    <SettingsSwitchItem
                        icon={<AvatarIcon />}
                        primaryText={t(
                            'pages.generalSettingsPage.components.generalSettingsForm.externalServices.allowLibravatar.primaryText',
                        )}
                        secondaryText={t(
                            'pages.generalSettingsPage.components.generalSettingsForm.externalServices.allowLibravatar.secondaryText',
                        )}
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
                    </SettingsSwitchItem>
                </Box>
            </form>
        </Container>
    );
};

export default GeneralSettingsForm;
