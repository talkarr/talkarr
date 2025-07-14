'use client';

import { useRouter } from 'next/navigation';

import type { FC } from 'react';
import type React from 'react';
import { useState } from 'react';

import { useSnackbar } from 'notistack';

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

        if (password.length < 8) {
            setPasswordError('Password must be at least 8 characters long');
            return;
        }

        if (password !== confirmPassword) {
            setPasswordError('Passwords do not match');
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
                enqueueSnackbar('Account created successfully!', {
                    variant: 'success',
                });
                router.push(homePageLink);
            } else {
                setLoading(false);
                console.warn(
                    'Account creation failed:',
                    result?.error || 'Unknown error',
                );
                enqueueSnackbar(
                    `Account creation failed: ${result?.error || 'Unknown error'}`,
                    {
                        variant: 'error',
                    },
                );
            }
        } catch (error) {
            console.warn('Account creation failed:', error);
            enqueueSnackbar('An unexpected error occurred. Please try again.', {
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
        >
            <StyledForm onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    label="Display name"
                    placeholder="Enter your display name"
                    type="text"
                    autoComplete="username"
                    value={displayName}
                    required
                    onChange={e => setDisplayName(e.target.value)}
                    disabled={loading}
                />
                <TextField
                    fullWidth
                    label="Email"
                    placeholder="Enter your email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    required
                    onChange={e => setEmail(e.target.value)}
                    disabled={loading}
                />
                <TextField
                    fullWidth
                    label="Password"
                    placeholder="Enter your password"
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
                    }}
                />
                <TextField
                    fullWidth
                    label="Confirm Password"
                    placeholder="Repeat your password"
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
                    }}
                />
                <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    type="submit"
                    loading={loading}
                    sx={{ mt: 2 }}
                >
                    Create your account
                </Button>
            </StyledForm>
        </Box>
    );
};

export default InitialAccountForm;
