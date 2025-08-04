'use client';

import type { BoxProps } from '@mui/material';

import type { FC } from 'react';
import { useState } from 'react';

import LanguageChanger from '@components/LanguageChanger';
import TranslateIcon from '@mui/icons-material/Translate';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';

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
