'use client';

import Link from 'next/link';

import type { FC } from 'react';
import React, { useMemo, useRef, useState } from 'react';

import type { ExtractSuccessData, SuccessData } from '@backend/types';

import type { SearchEventsResponse } from '@/app/_api/talks/search';
import type { AddTalksSearchRef } from '@/app/(globalModals)/talks/add/_components/AddTalksSearch';
import AddTalksSearch from '@/app/(globalModals)/talks/add/_components/AddTalksSearch';
import SearchItem, {
    SearchItemSkeleton,
} from '@/app/(globalModals)/talks/add/_components/SearchItem';

import useSearchExample from '@/hooks/useSearchExample';

import { mediaManagementSettingsPageLink } from '@/constants';

import { Sort } from '@components/SearchTextField';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export interface AddTalksPageProps {
    hasRootFolder: boolean;
    events: SuccessData<'/talks/list', 'get'>['events'] | null;
}

const AddTalksPage: FC<AddTalksPageProps> = ({ hasRootFolder, events }) => {
    const randomExample = useSearchExample();

    const [sort, setSort] = useState<Sort>(Sort.Relevance);

    const searchRef = useRef<AddTalksSearchRef>(null);

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] =
        useState<ExtractSuccessData<SearchEventsResponse> | null>(null);

    const [searchEmpty, setSearchEmpty] = useState<boolean>(true);

    const noResults = results && !loading && results.events.length === 0;

    const sortedResults = useMemo(() => {
        if (!results) {
            return null;
        }

        if (sort === Sort.Relevance) {
            return results.events;
        }

        return results.events.toSorted((a, b) => {
            const aDate = new Date(a.date);
            const bDate = new Date(b.date);

            if (sort === Sort.DateAsc) {
                return aDate.getTime() - bDate.getTime();
            }

            return bDate.getTime() - aDate.getTime();
        });
    }, [results, sort]);

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

    const searchActuallyEmpty = searchEmpty && !results?.events.length;

    return (
        <Box>
            <AddTalksSearch
                setLoading={setLoading}
                setError={setError}
                setResults={setResults}
                setSearchEmpty={setSearchEmpty}
                sort={sort}
                setSort={setSort}
                ref={searchRef}
            />
            {searchActuallyEmpty && !error && !loading ? (
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
            {loading ||
            (!searchActuallyEmpty &&
                !error &&
                typeof results?.events?.length === 'undefined') ? (
                <Box
                    mt={2}
                    display="flex"
                    flexDirection="column"
                    gap={1}
                    data-testid="search-results-loading"
                >
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
                        data-testid="rsearch-results-error"
                    >
                        {error}
                    </Typography>
                </Box>
            ) : null}
            {!searchActuallyEmpty && sortedResults && !loading ? (
                <Box
                    mt={2}
                    display="flex"
                    flexDirection="column"
                    gap={1}
                    data-testid="search-results"
                >
                    {sortedResults.map(event => (
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
