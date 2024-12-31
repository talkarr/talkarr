'use client';

import Link from 'next/link';

import type { FC } from 'react';
import React, { useRef, useState } from 'react';

import type { SearchEventsResponse } from '@/app/_api/talks/search';
import type { AddTalksSearchRef } from '@/app/(globalModals)/talks/add/_components/AddTalksSearch';
import AddTalksSearch from '@/app/(globalModals)/talks/add/_components/AddTalksSearch';
import SearchItem, {
    SearchItemSkeleton,
} from '@/app/(globalModals)/talks/add/_components/SearchItem';

import useSearchExample from '@/hooks/useSearchExample';

import { mediaManagementSettingsPageLink } from '@/constants';

import type { ExtractSuccessData, SuccessData } from '@backend/types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export interface AddTalksPageProps {
    hasRootFolder: boolean;
    events: SuccessData<'/talks/list', 'get'> | null;
}

const AddTalksPage: FC<AddTalksPageProps> = ({ hasRootFolder, events }) => {
    const randomExample = useSearchExample();

    const searchRef = useRef<AddTalksSearchRef>(null);

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] =
        useState<ExtractSuccessData<SearchEventsResponse> | null>(null);

    const [searchEmpty, setSearchEmpty] = useState<boolean>(true);

    const noResults = results && !loading && results.events.length === 0;

    if (!hasRootFolder) {
        return (
            <Box
                mt={4}
                display="flex"
                flexDirection="column"
                alignItems="center"
                gap={2}
            >
                <Typography variant="h3" fontWeight="normal" textAlign="center">
                    You do not have a root folder set up yet!
                </Typography>
                <Link href={mediaManagementSettingsPageLink}>
                    <Button variant="contained" color="primary">
                        Take me to the settings page
                    </Button>
                </Link>
            </Box>
        );
    }

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
                        <SearchItem
                            key={`event-${event.guid}`}
                            item={event}
                            isAlreadyAdded={events?.some(
                                e => e.guid === event.guid,
                            )}
                        />
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
