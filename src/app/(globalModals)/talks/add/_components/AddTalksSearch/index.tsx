import { useSearchParams } from 'next/navigation';

import type { FC } from 'react';
import React, {
    useCallback,
    useEffect,
    useImperativeHandle,
    useState,
} from 'react';

import type { SearchEventsResponse } from '@/app/_api/search';

import useSearchExample from '@/hooks/useSearchExample';

import { useApiStore } from '@/providers/apiStoreProvider';

import type { ExtractSuccessData } from '@backend/types';
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
}

const AddTalksSearch: FC<AddTalksSearchProps> = ({
    setLoading,
    setError,
    setResults,
    setSearchEmpty,
    ref,
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

            const result = await doSearch(searchTerm);

            if (!result) {
                setError('An error occurred while searching for talks.');
            } else if (result.success) {
                setResults(result.data);
            } else {
                setResults(null);
                setError(result.error);
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

    return (
        <Box flex={1} mb={2}>
            <form
                onSubmit={e => {
                    e.preventDefault();
                    handleSearch(search);
                }}
            >
                <SearchTextField
                    placeholder={randomExample ? `e.g. '${randomExample}'` : ''}
                    value={search}
                    onChange={e => {
                        setSearch(e.target.value);
                    }}
                />
            </form>
        </Box>
    );
};

export default AddTalksSearch;
