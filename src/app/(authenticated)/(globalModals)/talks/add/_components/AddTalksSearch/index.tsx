import type { Sort } from '@components/SearchTextField';

import { useSearchParams } from 'next/navigation';

import type { FC } from 'react';
import React, {
    useCallback,
    useEffect,
    useImperativeHandle,
    useState,
} from 'react';

import type { ExtractSuccessData } from '@backend/types';

import type { SearchEventsResponse } from '@/app/_api/talks/search';

import useSearchExample from '@/hooks/useSearchExample';

import { useApiStore } from '@/providers/apiStoreProvider';

import SearchTextField from '@components/SearchTextField';
import Box from '@mui/material/Box';
import { useDebounce } from '@uidotdev/usehooks';

export interface AddTalksSearchRef {
    handleSearch: (searchTerm: string) => Promise<void>;
}

export interface AddTalksSearchProps {
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setResults: (
        results: ExtractSuccessData<SearchEventsResponse> | null,
    ) => void;
    setSearchEmpty: (empty: boolean) => void;
    ref: React.Ref<AddTalksSearchRef>;
    sort: Sort;
    setSort: (sort: Sort) => void;
}

const AddTalksSearch: FC<AddTalksSearchProps> = ({
    setLoading,
    setError,
    setResults,
    setSearchEmpty,
    ref,
    sort,
    setSort,
}) => {
    const params = useSearchParams();
    const [search, setSearch] = useState<string>(params.get('search') || '');
    const randomExample = useSearchExample();

    useEffect(() => {
        setSearchEmpty(search.trim() === '');
    }, [search, setSearchEmpty]);

    useEffect(() => {
        const updatedSearch = params.get('search') || '';

        if (updatedSearch) {
            setSearch(updatedSearch);
        }
    }, [params]);

    const debouncedSearch = useDebounce(search, 500);

    const doSearch = useApiStore(state => state.doSearch);

    const handleSearch = useCallback(
        async (searchTerm: string): Promise<void> => {
            if (searchTerm.trim() === '') {
                return;
            }

            setLoading(true);
            setError(null);

            const result = await doSearch(searchTerm);

            if (result !== false) {
                if (!result) {
                    setError('An error occurred while searching for talks.');
                } else if (result.success) {
                    setResults(result.data);
                } else {
                    setResults(null);
                    setError(result.error);
                }
            }

            setLoading(false);
        },
        [doSearch, setError, setLoading, setResults],
    );

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

    useImperativeHandle(ref, () => ({
        handleSearch,
    }));

    useEffect(() => {
        if (search.trim() !== '') {
            setResults(null);
        }
    }, [search, setResults]);

    return (
        <Box flex={1} mb={2}>
            <form
                onSubmit={e => {
                    e.preventDefault();
                    handleSearch(search);
                }}
            >
                <SearchTextField
                    sort={sort}
                    setSort={setSort}
                    placeholder={randomExample ? `e.g. '${randomExample}'` : ''}
                    value={search}
                    onChange={e => {
                        setSearch(e.target.value);
                    }}
                    inputProps={{
                        'data-testid': 'add-talks-search',
                    }}
                />
            </form>
        </Box>
    );
};

export default AddTalksSearch;
