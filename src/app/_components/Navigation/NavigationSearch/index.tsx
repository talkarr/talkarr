'use client';

import { useRouter } from 'next/navigation';

import type { FC } from 'react';
import React, { useState } from 'react';

import { addTalksPageWithSearchLink } from '@/constants';

import SearchIcon from '@mui/icons-material/SearchRounded';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

const NavigationSearch: FC = () => {
    const router = useRouter();

    const [search, setSearch] = useState<string>('');

    const handleSearch = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();

        router.push(addTalksPageWithSearchLink(search));
    };

    return (
        <form onSubmit={handleSearch}>
            <Box display="flex" alignItems="flex-end" gap={1}>
                <SearchIcon />
                <TextField
                    size="small"
                    label="Search"
                    variant="standard"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    slotProps={{
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
