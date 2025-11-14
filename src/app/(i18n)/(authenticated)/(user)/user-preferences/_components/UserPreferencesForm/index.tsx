'use client';

import type { FC } from 'react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';

import SaveIcon from '@mui/icons-material/SaveRounded';

import moment from 'moment-timezone';
import { useSnackbar } from 'notistack';

import type { UserPreferences } from '@backend/user-preferences';

import {
    getUserPreferences,
    setUserPreferences,
} from '@/app/_api/user/preferences';
import type { UserInfo } from '@/app/(i18n)/(authenticated)/(user)/user-preferences/page';

export interface UserPreferencesFormProps {
    initialData: UserInfo;
}

const UserPreferencesForm: FC<UserPreferencesFormProps> = ({ initialData }) => {
    const { t } = useTranslation();

    const [userPreferences, internalSetUserPreferences] =
        useState<UserPreferences>(initialData.preferences);
    const [wasChanged, setWasChanged] = useState<boolean>(false);

    const { enqueueSnackbar } = useSnackbar();

    const setPreferences = (newPreferences: UserPreferences): void => {
        internalSetUserPreferences(newPreferences);
        setWasChanged(true);
    };

    const handleSubmit = async (event: React.FormEvent): Promise<void> => {
        event.preventDefault();

        if (!wasChanged) {
            return;
        }

        try {
            const response = await setUserPreferences(userPreferences);

            if (!response?.success) {
                console.error('Failed to set userPreferences:', response);
                enqueueSnackbar(t('messages.settingsSaveFailed'), {
                    variant: 'error',
                });
                return;
            }

            enqueueSnackbar(t('messages.settingsSaveSuccess'), {
                variant: 'success',
                preventDuplicate: true,
            });

            const updatedSettings = await getUserPreferences();

            if (updatedSettings?.success) {
                internalSetUserPreferences(updatedSettings.data);
                setWasChanged(false);
            } else {
                console.error(
                    'Failed to update userPreferences',
                    updatedSettings?.error,
                );
                enqueueSnackbar(t('messages.settingsSaveFailed'), {
                    variant: 'error',
                });
            }
        } catch (error) {
            console.error('Error updating userPreferences:', error);

            enqueueSnackbar(t('messages.settingsSaveFailed'), {
                variant: 'error',
            });
        }
    };

    return (
        <>
            <Box
                mb={2}
                display="flex"
                flexDirection="row"
                justifyContent="space-between"
                alignItems="flex-start"
            >
                <Typography variant="h4">
                    {t('pages.userPreferencesPage.title')}
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
                <Box>
                    <Box mb={2}>
                        <Typography variant="h6">
                            {t('pages.userPreferencesPage.timezone.title')}
                        </Typography>
                        <Typography variant="body2">
                            {t(
                                'pages.userPreferencesPage.timezone.description',
                            )}
                        </Typography>
                    </Box>
                    <FormControl fullWidth>
                        <InputLabel id="timezone-picker-label">
                            {t('pages.userPreferencesPage.timezone.label')}
                        </InputLabel>
                        <Select
                            labelId="timezone-picker-label"
                            id="timezone-picker"
                            value={userPreferences.timezone}
                            label={t(
                                'pages.userPreferencesPage.timezone.label',
                            )}
                            onChange={event => {
                                setPreferences({
                                    ...userPreferences,
                                    timezone: event.target.value,
                                });
                            }}
                        >
                            {moment.tz.names().map(tz => (
                                <MenuItem key={tz} value={tz}>
                                    <ListItemText>{tz}</ListItemText>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </form>
        </>
    );
};

export default UserPreferencesForm;
