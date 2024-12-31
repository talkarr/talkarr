'use client';

import type { FC } from 'react';
import React, { useRef, useState } from 'react';

import type { SearchEventsResponse } from '@/app/_api/search';
import type { AddTalksSearchRef } from '@/app/(globalModals)/talks/add/_components/AddTalksSearch';
import AddTalksSearch from '@/app/(globalModals)/talks/add/_components/AddTalksSearch';
import SearchItem, {
    SearchItemSkeleton,
} from '@/app/(globalModals)/talks/add/_components/SearchItem';

import useSearchExample from '@/hooks/useSearchExample';

import type { ExtractSuccessData } from '@backend/types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const AddTalksPage: FC = () => {
    const randomExample = useSearchExample();

    const searchRef = useRef<AddTalksSearchRef>(null);

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] =
        useState<ExtractSuccessData<SearchEventsResponse> | null>(null);

    const [searchEmpty, setSearchEmpty] = useState<boolean>(true);

    const noResults = results && !loading && results.events.length === 0;

    return (
        <Box>
            <AddTalksSearch
                setLoading={setLoading}
                setError={setError}
                setResults={setResults}
                setSearchEmpty={setSearchEmpty}
                ref={searchRef}
            />
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
                <Box mt={2} display="flex" flexDirection="column" gap={1}>
                    {Array.from({ length: 5 }).map((_, index) => (
                        <SearchItemSkeleton key={index} />
                    ))}
                </Box>
            ) : error ? (
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
            {!searchEmpty && results && !loading ? (
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
                        No results found!
                    </Typography>
                </Box>
            ) : null}
        </Box>
    );
};

export default AddTalksPage;
