'use client';

import type { NextPage } from 'next';

import { useState } from 'react';

import { useSnackbar } from 'notistack';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

const Page: NextPage = () => {
    const [wellKnownUrl, setWellKnownUrl] = useState('');
    const [clientId, setClientId] = useState('');
    const [clientSecret, setClientSecret] = useState('');
    const { enqueueSnackbar } = useSnackbar();

    const handleSubmit = async (): Promise<void> => {
        const response = await fetch('/api/settings/oidc', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ wellKnownUrl, clientId, clientSecret }),
        });

        if (response.ok) {
            enqueueSnackbar('Settings saved successfully', {
                variant: 'success',
                preventDuplicate: true,
            });
        } else {
            enqueueSnackbar('Failed to save settings', {
                variant: 'error',
            });
        }
    };

    return (
        <Box>
            <Typography variant="h3">OIDC Settings</Typography>
            <Box mt={2}>
                <TextField
                    label="Well-Known URL"
                    fullWidth
                    value={wellKnownUrl}
                    onChange={e => setWellKnownUrl(e.target.value)}
                />
            </Box>
            <Box mt={2}>
                <TextField
                    label="Client ID"
                    fullWidth
                    value={clientId}
                    onChange={e => setClientId(e.target.value)}
                />
            </Box>
            <Box mt={2}>
                <TextField
                    label="Client Secret"
                    fullWidth
                    type="password"
                    value={clientSecret}
                    onChange={e => setClientSecret(e.target.value)}
                />
            </Box>
            <Box mt={2}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                >
                    Save
                </Button>
            </Box>
        </Box>
    );
};

export default Page;
