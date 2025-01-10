'use client';

import type { FC } from 'react';
import { useEffect } from 'react';

import TalkFiles from '@/app/(globalModals)/talks/[slug]/_components/TalkFiles';
import TalkHeader from '@/app/(globalModals)/talks/[slug]/_components/TalkHeader';
import TalkToolbar from '@/app/(globalModals)/talks/[slug]/_components/TalkToolbar';
import type { SingleTalkData } from '@/app/(globalModals)/talks/[slug]/page';

import { useApiStore } from '@/providers/apiStoreProvider';

import Box from '@mui/material/Box';

export interface TalkWrapperProps {
    initialData: SingleTalkData;
}

const TalkWrapper: FC<TalkWrapperProps> = ({ initialData }) => {
    const getSingleTalkData = useApiStore(state => state.getSingleTalkData);
    const singleTalkData = useApiStore(state => state.singleTalkData);

    console.warn('initialData', {
        talk: initialData.talk.slug,
        db: initialData.db.slug,
    });

    useEffect(() => {
        const func = async (): Promise<void> => {
            await getSingleTalkData({ guid: initialData.talk.guid });
        };

        const intervalMs = initialData.info.is_downloading ? 1000 : 5000;

        const interval = setInterval(func, intervalMs);

        func();

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [
        getSingleTalkData,
        initialData.info.is_downloading,
        initialData.talk.guid,
    ]);

    return (
        <>
            <TalkToolbar data={singleTalkData || initialData} />
            <Box display="flex" flexDirection="column" gap={1} width="100%">
                <Box flex={1}>
                    <TalkHeader data={singleTalkData || initialData} />
                </Box>
                <Box flex={1}>
                    <TalkFiles data={singleTalkData || initialData} />
                </Box>
            </Box>
        </>
    );
};

export default TalkWrapper;
