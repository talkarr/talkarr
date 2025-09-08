'use client';

import Link from 'next/link';

import type { FC } from 'react';
import React, { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import type { ExtractSuccessData, SuccessData } from '@backend/types';

import type { SearchEventsResponse } from '@/app/_api/talks/search';
import type { AddTalksSearchRef } from '@/app/(i18n)/(authenticated)/talks/add/_components/AddTalksSearch';
import AddTalksSearch from '@/app/(i18n)/(authenticated)/talks/add/_components/AddTalksSearch';
import SearchItem, {
    SearchItemSkeleton,
} from '@/app/(i18n)/(authenticated)/talks/add/_components/SearchItem';

import useSearchExample from '@/hooks/use-search-example';

import { mediaManagementSettingsPageLink } from '@/constants';

import { SearchTextFieldSortMethod } from '@components/SearchTextField';

export interface AddTalksPageProps {
    hasRootFolder: boolean;
    events: SuccessData<'/talks/basic-list', 'get'> | null;
}

const AddTalksPage: FC<AddTalksPageProps> = ({ hasRootFolder, events }) => {
    const randomExample = useSearchExample();
    const { t } = useTranslation();

    const [sortMethod, setSortMethod] = useState<SearchTextFieldSortMethod>(
        SearchTextFieldSortMethod.Relevance,
    );

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

        if (sortMethod === SearchTextFieldSortMethod.Relevance) {
            return results.events;
        }

        return results.events.toSorted((a, b) => {
            const aDate = new Date(a.date ?? 0);
            const bDate = new Date(b.date ?? 0);

            if (sortMethod === SearchTextFieldSortMethod.DateAsc) {
                return aDate.getTime() - bDate.getTime();
            }

            return bDate.getTime() - aDate.getTime();
        });
    }, [results, sortMethod]);

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
                    {t('pages.addTalksPage.rootFolderNotFound')}
                </Typography>
                <Link href={mediaManagementSettingsPageLink}>
                    <Button variant="contained" color="primary">
                        {t('pages.addTalksPage.rootFolderNotFoundButtonText')}
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
                sortMethod={sortMethod}
                setSortMethod={setSortMethod}
                ref={searchRef}
            />
            {searchActuallyEmpty && !error && !loading ? (
                <Box mt={4}>
                    <Typography
                        variant="h3"
                        fontWeight="normal"
                        textAlign="center"
                    >
                        {t('pages.addTalksPage.addTalkDescription')}
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
                        {t('pages.addTalksPage.errorOccurred')}
                    </Typography>
                    <Typography
                        variant="subtitle1"
                        fontWeight="normal"
                        textAlign="center"
                        color="textDisabled"
                        data-testid="search-results-error-message"
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
                    {sortedResults.map((event, index) => (
                        <SearchItem
                            key={`event-${event.guid}`}
                            index={index}
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
                        {t('pages.addTalksPage.noSearchResults')}
                    </Typography>
                </Box>
            ) : null}
        </Box>
    );
};

export default AddTalksPage;
