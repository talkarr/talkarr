'use client';

import type { TextFieldProps } from '@mui/material';

import type { FC } from 'react';

import { styled } from '@mui/material';
import TextField from '@mui/material/TextField';

const InternalMaterialSearchBar = styled(TextField)(({ theme }) => ({
    // make background grey
    '& .MuiOutlinedInput-root': {
        backgroundColor: theme.palette.mode === 'dark' ? '#424242' : '#f5f5f5',
        borderRadius: theme.shape.borderRadius * 4,
    },
}));

const MaterialSearchBar: FC<Omit<TextFieldProps, 'variant'>> = props => (
    <InternalMaterialSearchBar variant="outlined" {...props} />
);

export default MaterialSearchBar;
