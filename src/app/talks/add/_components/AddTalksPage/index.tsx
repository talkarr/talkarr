'use client';

import { useSearchParams } from 'next/navigation';

import type { FC } from 'react';
import React, { useCallback, useEffect, useState } from 'react';

import type { SearchEventsResponse } from '@/app/_api/search';
import SearchItem from '@/app/talks/add/_components/SearchItem';

import useSearchExample from '@/hooks/useSearchExample';

import { useApiStore } from '@/providers/apiStoreProvider';

import type { ExtractSuccessData } from '@backend/types';
import CustomTextField from '@components/CustomTextField';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useDebounce } from '@uidotdev/usehooks';

const AddTalksPage: FC = () => {
    const params = useSearchParams();
    const doSearch = useApiStore(state => state.doSearch);
    const randomExample = useSearchExample();

    const [search, setSearch] = useState<string>(params.get('search') || '');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] =
        useState<ExtractSuccessData<SearchEventsResponse> | null>(null);

    const debouncedSearch = useDebounce(search, 500);

    const searchEmpty = search.trim() === '';

    const handleSearch = useCallback(
        async (searchTerm: string): Promise<void> => {
            if (searchTerm.trim() === '') {
                return;
            }

            setLoading(true);

            const result = await doSearch(searchTerm);

            if (!result) {
                setError('An error occurred while searching for talks.');
            } else if (result.success) {
                setResults(result.data);
            } else {
                setError(result.message);
            }

            setLoading(false);
        },
        [doSearch],
    );

    useEffect(() => {
        const updatedSearch = params.get('search') || '';

        if (updatedSearch) {
            setSearch(updatedSearch);
        }
    }, [params, handleSearch]);

    useEffect(() => {
        if (debouncedSearch) {
            const searchParams = new URLSearchParams();
            searchParams.set('search', debouncedSearch);
            window.history.replaceState(
                {},
                '',
                `${window.location.pathname}?${searchParams.toString()}`,
            );
            handleSearch(debouncedSearch);
        }
    }, [debouncedSearch, handleSearch]);

    const noResults = results && !loading && results.events.length === 0;

    return (
        <Box>
            <Box flex={1} mb={2}>
                <form
                    onSubmit={e => {
                        e.preventDefault();
                        handleSearch(search);
                    }}
                >
                    <CustomTextField
                        placeholder={
                            randomExample ? `e.g. '${randomExample}'` : ''
                        }
                        value={search}
                        onChange={e => {
                            setSearch(e.target.value);
                        }}
                    />
                </form>
            </Box>
            {searchEmpty ? (
                <Box mt={4}>
                    <Typography
                        variant="h3"
                        fontWeight="normal"
                        textAlign="center"
                    >
                        To add a talk, just enter something about it in the
                        search box! 🎉
                    </Typography>
                    <Typography
                        variant="subtitle1"
                        fontWeight="normal"
                        textAlign="center"
                    >
                        {randomExample ? `e.g. '${randomExample}` : ''}
                    </Typography>
                </Box>
            ) : null}
            {loading ? (
                <Box display="flex" justifyContent="center" mt={4}>
                    <CircularProgress />
                </Box>
            ) : null}
            {error ? (
                <Box mt={4}>
                    <Typography
                        variant="h3"
                        fontWeight="normal"
                        textAlign="center"
                    >
                        {error}
                    </Typography>
                </Box>
            ) : null}
            {results && !loading ? (
                <Box mt={2} display="flex" flexDirection="column" gap={1}>
                    {results.events.map(event => (
                        <SearchItem key={`event-${event.guid}`} item={event} />
                    ))}
                </Box>
            ) : null}
            {noResults ? (
                <Box mt={4}>
                    <Typography
                        variant="h3"
                        fontWeight="normal"
                        textAlign="center"
                    >
                        {`No results found for "${search}".`}
                    </Typography>
                </Box>
            ) : null}
        </Box>
    );
};

export default AddTalksPage;
