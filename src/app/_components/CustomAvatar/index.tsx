'use client';

import { styled } from '@mui/material';
import Avatar from '@mui/material/Avatar';

const CustomAvatar = styled(Avatar)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius * 2,
}));

export default CustomAvatar;
