'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import type { FC } from 'react';
import { useEffect, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';

import PreviousPageIcon from '@mui/icons-material/ArrowBack';
import NextPageIcon from '@mui/icons-material/ArrowForward';

import type { SuccessData } from '@backend/types';

export interface YourMediaPageControlsProps {
    initialData: SuccessData<'/talks/list', 'get'>;
}

const YourMediaPageControls: FC<YourMediaPageControlsProps> = ({
    initialData,
}) => {
    const { total, page, limit } = initialData;
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [isNavigating, setIsNavigating] = useState<boolean>(false);

    useEffect(() => {
        setIsNavigating(false);
    }, [pathname, searchParams]);

    const canGoToPreviousPage = useMemo(() => (page ?? 0) > 1, [page]);
    const canGoToNextPage = useMemo(
        () => (page ?? 0) * (limit ?? 0) < (total ?? 0),
        [page, limit, total],
    );

    const maxPage = useMemo(
        () => Math.ceil((total ?? 0) / (limit ?? 1)),
        [total, limit],
    );

    const goToPage = (newPage: number): void => {
        if (isNavigating) {
            return;
        }

        const url = new URL(pathname ?? '', window.location.origin);
        url.searchParams.set('page', newPage.toString());
        setIsNavigating(true);
        router.push(url.pathname + url.search);
    };

    const goToPreviousPage = (): void => {
        if (!canGoToPreviousPage) {
            return;
        }

        goToPage((page ?? 2) - 1);
    };

    const goToNextPage = (): void => {
        if (!canGoToNextPage) {
            return;
        }

        goToPage((page ?? 0) + 1);
    };

    return (
        <Container sx={{ my: 2 }}>
            <Box
                display="flex"
                flexDirection="row"
                alignItems="center"
                justifyContent="center"
                gap={4}
                mb={2}
            >
                <IconButton
                    color="primary"
                    disabled={!canGoToPreviousPage || isNavigating}
                    onClick={goToPreviousPage}
                >
                    <PreviousPageIcon />
                </IconButton>
                <Box>
                    Page {page} of {maxPage}
                </Box>
                <IconButton
                    color="primary"
                    disabled={!canGoToNextPage || isNavigating}
                    onClick={goToNextPage}
                >
                    <NextPageIcon />
                </IconButton>
            </Box>
        </Container>
    );
};

export default YourMediaPageControls;
