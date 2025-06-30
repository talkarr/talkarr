'use client';

import type { TableContainerProps } from '@mui/material';

import type { FC } from 'react';

import { styled } from '@mui/material';
import TableContainer from '@mui/material/TableContainer';

const InternalMaterialTable = styled(TableContainer)(({ theme }) => ({
    // more rounded corners
    borderRadius: theme.shape.borderRadius * 3,
}));

const MaterialTable: FC<TableContainerProps> = props => (
    <InternalMaterialTable {...props} />
);

export default MaterialTable;
