'use client';

import type { FC } from 'react';

import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ClearIcon from '@mui/icons-material/Clear';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import SearchIcon from '@mui/icons-material/Search';
import type { InputBaseProps } from '@mui/material';
import { alpha, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Paper from '@mui/material/Paper';

export enum Sort {
    Relevance,
    DateAsc,
    DateDesc,
    MAX = DateDesc,
}

export interface CustomTextFieldProps extends InputBaseProps {
    sort: Sort;
    setSort: (sort: Sort) => void;
}

const SearchTextField: FC<CustomTextFieldProps> = ({
    value,
    onChange,
    sort,
    setSort,
    ...rest
}) => {
    const theme = useTheme();

    const onClear = (): void => {
        if (onChange) {
            onChange({ target: { value: '' } } as any);
        }
    };

    return (
        <Paper
            sx={{
                paddingX: 0.5,
                display: 'flex',
                alignItems: 'center',
                borderRadius: 3,
            }}
        >
            <Box
                sx={{ ml: 0.5, paddingX: 1, paddingY: 1 }}
                display="flex"
                alignItems="center"
            >
                <SearchIcon />
            </Box>
            <InputBase
                {...rest}
                value={value}
                onChange={onChange}
                sx={{
                    ml: 1,
                    mr: 1,
                    paddingY: 0,
                    flex: 1,
                    height: '100%',
                    ...rest.sx,
                }}
                slotProps={{
                    input: {
                        sx: {
                            paddingY: 2,
                        },
                    },
                }}
            />
            <Divider
                orientation="vertical"
                flexItem
                sx={{ borderColor: alpha(theme.palette.divider, 0.2) }}
            />
            <IconButton
                sx={{ marginX: 1, paddingX: 1, paddingY: 1 }}
                onClick={() => {
                    setSort((sort + 1) % (Sort.MAX + 1));
                }}
            >
                {sort === Sort.Relevance ? (
                    <AutoAwesomeIcon />
                ) : sort === Sort.DateAsc ? (
                    <KeyboardArrowUpIcon />
                ) : (
                    <KeyboardArrowDownIcon />
                )}
            </IconButton>
            <Divider
                orientation="vertical"
                flexItem
                sx={{ borderColor: alpha(theme.palette.divider, 0.2) }}
            />
            <IconButton
                sx={{ ml: 1, mr: 0.5, paddingX: 1, paddingY: 1 }}
                onClick={onClear}
            >
                <ClearIcon />
            </IconButton>
        </Paper>
    );
};

export default SearchTextField;
