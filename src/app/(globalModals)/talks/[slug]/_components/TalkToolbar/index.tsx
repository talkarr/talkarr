'use client';

import type { FC } from 'react';

import VerticalIconButton from '@components/VerticalIconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { alpha, styled } from '@mui/material';
import Box from '@mui/material/Box';

export interface TalkToolbarProps {}

const StyledContainer = styled(Box)(({ theme }) => ({
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: theme.spacing(0.5, 4),
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
    backgroundColor: theme.palette.background.paper,
}));

const TalkToolbar: FC<TalkToolbarProps> = () => (
    <StyledContainer>
        <VerticalIconButton icon={<EditIcon />} square>
            Edit
        </VerticalIconButton>
        <VerticalIconButton icon={<DeleteIcon />} square>
            Delete
        </VerticalIconButton>
    </StyledContainer>
);

export default TalkToolbar;
