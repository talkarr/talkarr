'use client';

import { useRouter } from 'next/navigation';

import type { FC } from 'react';
import React, { useState } from 'react';

import { useSnackbar } from 'notistack';

import { loginUser } from '@/app/_api/user/login';

import { homePageLink } from '@/constants';

import { styled } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

const StyledForm = styled('form')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    width: '100%',
}));

const LoginPageForm: FC = () => {
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>,
    ): Promise<void> => {
        event.preventDefault();

        setLoading(true);

        try {
            const result = await loginUser({ email, password });

            console.log('foo', result);

            if (result?.success) {
                router.push(homePageLink);
            } else {
                setLoading(false);
                // Handle login error, e.g., show an error message
                console.warn('Login failed:', result?.error || 'Unknown error');
                enqueueSnackbar(
                    `Login failed: ${result?.error || 'Unknown error'}`,
                    {
                        variant: 'error',
                    },
                );
            }
        } catch (error) {
            console.error('Login error:', error);
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
                    label="Email"
                    placeholder="Email"
                    type="email"
                    value={email}
                    required
                    onChange={e => setEmail(e.target.value)}
                    disabled={loading}
                />
                <TextField
                    fullWidth
                    label="Password"
                    placeholder="Password"
                    type="password"
                    value={password}
                    required
                    onChange={e => setPassword(e.target.value)}
                    disabled={loading}
                />
                <Button
                    fullWidth
                    variant="contained"
                    type="submit"
                    loading={loading}
                >
                    Login
                </Button>
            </StyledForm>
        </Box>
    );
};

export default LoginPageForm;
