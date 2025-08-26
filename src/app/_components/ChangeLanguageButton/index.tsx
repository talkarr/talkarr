'use client';

import type { FC } from 'react';
import { useState } from 'react';

import TranslateIcon from '@mui/icons-material/Translate';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';

import type { BoxProps } from '@mui/material';

import LanguageChanger from '@components/LanguageChanger';

const ChangeLanguageButton: FC<BoxProps> = props => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    return (
        <>
            <Box {...props}>
                <IconButton
                    aria-label="change language"
                    onClick={event => setAnchorEl(event.currentTarget)}
                    color="inherit"
                    data-testid="change-language-button"
                >
                    <TranslateIcon />
                </IconButton>
            </Box>
            <LanguageChanger
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
            />
        </>
    );
};

export default ChangeLanguageButton;
