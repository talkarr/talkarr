'use client';

import type { FC } from 'react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { alpha, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';

import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ClearIcon from '@mui/icons-material/Clear';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import SearchIcon from '@mui/icons-material/Search';

import type { InputBaseProps } from '@mui/material';

// Note: Remember to update the Sort enum in the translations
export enum SearchTextFieldSortMethod {
    Relevance,
    DateAsc,
    DateDesc,
}

export interface CustomTextFieldProps extends InputBaseProps {
    sortMethod: SearchTextFieldSortMethod;
    setSortMethod: (sort: SearchTextFieldSortMethod) => void;
}

const SortIconMap: Record<SearchTextFieldSortMethod, React.ReactNode> = {
    [SearchTextFieldSortMethod.Relevance]: <AutoAwesomeIcon />,
    [SearchTextFieldSortMethod.DateAsc]: <KeyboardArrowUpIcon />,
    [SearchTextFieldSortMethod.DateDesc]: <KeyboardArrowDownIcon />,
};

const SearchTextField: FC<CustomTextFieldProps> = ({
    value,
    onChange,
    sortMethod,
    setSortMethod,
    ...rest
}) => {
    const theme = useTheme();
    const { t } = useTranslation();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const menuIsOpen = Boolean(anchorEl);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>): void => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = (): void => {
        setAnchorEl(null);
    };

    const onClear = (): void => {
        if (onChange) {
            onChange({ target: { value: '' } } as any);
        }
    };

    return (
        <>
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
                <Tooltip title={t('components.searchTextField.sortTooltip')}>
                    <IconButton
                        sx={{ marginX: 1, paddingX: 1, paddingY: 1 }}
                        onClick={handleMenuOpen}
                    >
                        {SortIconMap[sortMethod]}
                    </IconButton>
                </Tooltip>
                <Divider
                    orientation="vertical"
                    flexItem
                    sx={{ borderColor: alpha(theme.palette.divider, 0.2) }}
                />
                <Tooltip title={t('components.searchTextField.clearTooltip')}>
                    <IconButton
                        sx={{ ml: 1, mr: 0.5, paddingX: 1, paddingY: 1 }}
                        onClick={onClear}
                    >
                        <ClearIcon />
                    </IconButton>
                </Tooltip>
            </Paper>
            <Menu
                anchorEl={anchorEl}
                open={menuIsOpen}
                onClose={handleMenuClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                {(
                    Object.values(SearchTextFieldSortMethod).filter(
                        sortOption => typeof sortOption === 'string',
                    ) as (keyof typeof SearchTextFieldSortMethod)[]
                ).map(sortKey => (
                    <MenuItem
                        key={sortKey}
                        selected={
                            sortMethod === SearchTextFieldSortMethod[sortKey]
                        }
                        onClick={() => {
                            setSortMethod(SearchTextFieldSortMethod[sortKey]);
                            handleMenuClose();
                        }}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                        }}
                    >
                        <ListItemIcon>
                            {
                                SortIconMap[
                                    SearchTextFieldSortMethod[
                                        sortKey
                                    ] as SearchTextFieldSortMethod
                                ]
                            }
                        </ListItemIcon>
                        <ListItemText
                            primary={t(
                                `enums.searchTextFieldSortMethod.${sortKey}`,
                            )}
                        />
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};

export default SearchTextField;
