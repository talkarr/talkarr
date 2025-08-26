'use client';

import { useRouter } from 'next/navigation';

import type { FC } from 'react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { styled } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';

import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import { useSnackbar } from 'notistack';

import { loginUser } from '@/app/_api/user/login';

import { homePageLink } from '@/constants';

const StyledForm = styled('form')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    width: '100%',
}));

const LoginPageForm: FC = () => {
    const { t } = useTranslation();

    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();

    const [email, setEmail] = useState<string>('');

    const [password, setPassword] = useState<string>('');
    const [passwordVisible, setPasswordVisible] = useState<boolean>(false);

    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>,
    ): Promise<void> => {
        event.preventDefault();

        setLoading(true);
        setPasswordVisible(false);

        try {
            const result = await loginUser({ email, password });

            if (result?.success) {
                router.push(homePageLink);
            } else {
                setLoading(false);
                // Handle login error, e.g., show an error message
                console.warn(
                    'Login failed:',
                    result?.error || t('errors.unknownError'),
                );
                enqueueSnackbar(
                    t('pages.loginPage.components.loginPageForm.loginFailed', {
                        error: result?.error || t('errors.unknownError'),
                    }),
                    {
                        variant: 'error',
                    },
                );
            }
        } catch (error) {
            console.warn('Login error:', error);
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
            minWidth={{ lg: 350 }}
            padding={{ xs: 2, lg: 0 }}
            data-testid="login-page-form"
        >
            <StyledForm onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    label={t('common.email')}
                    placeholder={t('common.emailPlaceholder')}
                    type="email"
                    autoComplete="email"
                    value={email}
                    required
                    onChange={e => setEmail(e.target.value)}
                    disabled={loading}
                    slotProps={{
                        htmlInput: {
                            'data-testid': 'login-form-email',
                        },
                    }}
                />
                <TextField
                    fullWidth
                    label={t('common.password')}
                    placeholder={t('common.passwordPlaceholder')}
                    type={passwordVisible ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    required
                    onChange={e => setPassword(e.target.value)}
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
                            'data-testid': 'login-form-password',
                        },
                    }}
                />
                <Button
                    fullWidth
                    variant="contained"
                    type="submit"
                    loading={loading}
                    data-testid="login-form-submit"
                >
                    {t('common.login')}
                </Button>
            </StyledForm>
        </Box>
    );
};

export default LoginPageForm;
