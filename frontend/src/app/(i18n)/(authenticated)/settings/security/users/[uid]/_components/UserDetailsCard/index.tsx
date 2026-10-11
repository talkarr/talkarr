'use client';

import { styled } from '@mui/material';
import Card from '@mui/material/Card';

const UserDetailsCard = styled(Card)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius * 3,

    '.MuiCardHeader-title': {
        ...theme.typography.h5,
    },

    '.MuiCardHeader-root': {
        padding: theme.spacing(4),
        paddingBottom: theme.spacing(1),
    },

    '.MuiCardContent-root': {
        padding: theme.spacing(2),
        paddingTop: theme.spacing(0),
    },
}));

export default UserDetailsCard;
