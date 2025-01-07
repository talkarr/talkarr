'use client';

import type { FC } from 'react';

import { alpha, styled } from '@mui/material';
import Box from '@mui/material/Box';

export interface TalkToolbarProps {}

const StyledContainer = styled(Box)(({ theme }) => ({
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(1),
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
    backgroundColor: theme.palette.background.paper,
}));

const TalkToolbar: FC<TalkToolbarProps> = () => (
    <StyledContainer>TalkToolbar</StyledContainer>
);

export default TalkToolbar;
