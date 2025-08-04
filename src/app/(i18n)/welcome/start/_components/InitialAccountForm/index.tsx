'use client';

import { useRouter } from 'next/navigation';

import type { FC } from 'react';
import type React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useSnackbar } from 'notistack';

import { validatePassword } from '@backend/passwords';

import { registerInitialUser } from '@/app/_api/user/register-initial';

import { homePageLink } from '@/constants';

import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { styled } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';

const StyledForm = styled('form')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
    width: '100%',
}));

const InitialAccountForm: FC = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();

    const [email, setEmail] = useState<string>('');
    const [displayName, setDisplayName] = useState<string>('');

    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [passwordVisible, setPasswordVisible] = useState<boolean>(false);

    const [passwordError, setPasswordError] = useState<string | null>(null);

    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>,
    ): Promise<void> => {
        event.preventDefault();

        setPasswordError(null);
        setPasswordVisible(false);

        if (!validatePassword(password)) {
            setPasswordError(
                t(
                    'pages.welcomeStart.components.initialAccountForm.passwordRequirements',
                ),
            );
            return;
        }

        if (password !== confirmPassword) {
            setPasswordError(
                t(
                    'pages.welcomeStart.components.initialAccountForm.passwordMismatch',
                ),
            );
            return;
        }

        setLoading(true);

        try {
            const result = await registerInitialUser({
                email,
                displayName,
                password,
            });

            if (result?.success) {
                enqueueSnackbar(
                    t(
                        'pages.welcomeStart.components.initialAccountForm.accountCreated',
                    ),
                    {
                        variant: 'success',
                    },
                );
                router.push(homePageLink);
            } else {
                setLoading(false);
                console.warn(
                    'Account creation failed:',
                    result?.error || 'Unknown error',
                );
                enqueueSnackbar(
                    t(
                        'pages.welcomeStart.components.initialAccountForm.accountCreationFailed',
                        {
                            error: result?.error || t('errors.unknownError'),
                        },
                    ),
                    {
                        variant: 'error',
                    },
                );
            }
        } catch (error) {
            console.warn('Account creation failed:', error);
            enqueueSnackbar(t('errors.unexpectedError'), {
                variant: 'error',
            });
            setLoading(false);
        }
    };

    return (
        <Box
            display="flex"
            flexDirection="column"
            gap={2}
            width="100%"
            minWidth={350}
            padding={{ xs: 2, lg: 0 }}
            data-testid="initial-account-form"
        >
            <StyledForm onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    label={t(
                        'pages.welcomeStart.components.initialAccountForm.displayName',
                    )}
                    placeholder={t(
                        'pages.welcomeStart.components.initialAccountForm.displayNamePlaceholder',
                    )}
                    type="text"
                    autoComplete="username"
                    value={displayName}
                    required
                    onChange={e => setDisplayName(e.target.value)}
                    disabled={loading}
                    slotProps={{
                        htmlInput: {
                            'data-testid': 'display-name-input',
                        },
                    }}
                />
                <TextField
                    fullWidth
                    label={t(
                        'pages.welcomeStart.components.initialAccountForm.email',
                    )}
                    placeholder={t(
                        'pages.welcomeStart.components.initialAccountForm.emailPlaceholder',
                    )}
                    type="email"
                    autoComplete="email"
                    value={email}
                    required
                    onChange={e => setEmail(e.target.value)}
                    disabled={loading}
                    slotProps={{
                        htmlInput: {
                            'data-testid': 'email-input',
                        },
                    }}
                />
                <TextField
                    fullWidth
                    label={t(
                        'pages.welcomeStart.components.initialAccountForm.password',
                    )}
                    placeholder={t(
                        'pages.welcomeStart.components.initialAccountForm.passwordPlaceholder',
                    )}
                    type={passwordVisible ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={password}
                    required
                    onChange={e => setPassword(e.target.value)}
                    disabled={loading}
                    error={!!passwordError}
                    helperText={passwordError}
                    slotProps={{
                        input: {
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() =>
                                            setPasswordVisible(state => !state)
                                        }
                                        edge="end"
                                    >
                                        {passwordVisible ? (
                                            <VisibilityOffIcon />
                                        ) : (
                                            <VisibilityIcon />
                                        )}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        },
                        htmlInput: {
                            'data-testid': 'password-input',
                        },
                        formHelperText: {
                            'data-testid': 'password-error-text',
                        },
                    }}
                />
                <TextField
                    fullWidth
                    label={t(
                        'pages.welcomeStart.components.initialAccountForm.confirmPassword',
                    )}
                    placeholder={t(
                        'pages.welcomeStart.components.initialAccountForm.confirmPasswordPlaceholder',
                    )}
                    type={passwordVisible ? 'text' : 'password'}
                    autoComplete="off"
                    value={confirmPassword}
                    required
                    onChange={e => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    slotProps={{
                        input: {
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() =>
                                            setPasswordVisible(state => !state)
                                        }
                                        edge="end"
                                    >
                                        {passwordVisible ? (
                                            <VisibilityOffIcon />
                                        ) : (
                                            <VisibilityIcon />
                                        )}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        },
                        htmlInput: {
                            'data-testid': 'confirm-password-input',
                        },
                    }}
                />
                <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    type="submit"
                    loading={loading}
                    sx={{ mt: 2 }}
                    data-testid="create-account-button"
                >
                    {t(
                        'pages.welcomeStart.components.initialAccountForm.createAccountButton',
                    )}
                </Button>
            </StyledForm>
        </Box>
    );
};

export default InitialAccountForm;
