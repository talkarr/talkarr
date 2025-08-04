'use client';

import { useRouter } from 'next/navigation';

import type { FC } from 'react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { addTalksPageWithSearchLink } from '@/constants';

import MaterialSearchBar from '@components/MaterialSearchBar';
import SearchIcon from '@mui/icons-material/SearchRounded';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';

const NavigationSearch: FC = () => {
    const router = useRouter();
    const { t } = useTranslation();

    const [search, setSearch] = useState<string>('');

    const handleSearch = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();

        router.push(addTalksPageWithSearchLink(search));
    };

    return (
        <form onSubmit={handleSearch} style={{ width: '100%' }}>
            <Box
                display="flex"
                alignItems="flex-end"
                gap={1}
                width="100%"
                maxWidth="400px"
            >
                <MaterialSearchBar
                    size="small"
                    fullWidth
                    placeholder={t(
                        'components.navigation.navigationSearch.searchPlaceholder',
                    )}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    slotProps={{
                        input: {
                            sx: {
                                padding: 0,
                            },
                            startAdornment: (
                                <IconButton size="small" sx={{ marginX: 1 }}>
                                    <SearchIcon fontSize="small" />
                                </IconButton>
                            ),
                        },
                        htmlInput: {
                            'data-testid': 'navigation-search',
                        },
                    }}
                />
            </Box>
        </form>
    );
};

export default NavigationSearch;
