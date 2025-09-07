'use client';

import type { FC } from 'react';
import { useEffect } from 'react';

import Box from '@mui/material/Box';

import TalkFiles from '@/app/(i18n)/(authenticated)/talks/[slug]/_components/TalkFiles';
import TalkHeader from '@/app/(i18n)/(authenticated)/talks/[slug]/_components/TalkHeader';
import TalkToolbar, {
    talkToolbarHeight,
} from '@/app/(i18n)/(authenticated)/talks/[slug]/_components/TalkToolbar';
import type { SingleTalkData } from '@/app/(i18n)/(authenticated)/talks/[slug]/page';

import { appbarHeight } from '@/constants';
import { useApiStore } from '@/providers/api-store-provider';

export interface TalkWrapperProps {
    initialData: SingleTalkData;
}

const TalkWrapper: FC<TalkWrapperProps> = ({ initialData }) => {
    const getSingleTalkData = useApiStore(state => state.getSingleTalkData);
    const singleTalkData = useApiStore(state => state.singleTalkData);
    const clearSingleTalkData = useApiStore(state => state.clearSingleTalkData);

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

            clearSingleTalkData();
        };
    }, [
        clearSingleTalkData,
        getSingleTalkData,
        initialData.info.is_downloading,
        initialData.talk.guid,
    ]);

    return (
        <>
            <TalkToolbar data={singleTalkData || initialData} />
            <Box
                display="flex"
                flexDirection="column"
                gap={1}
                width="100%"
                pt={1}
                height={`calc(100vh - ${appbarHeight - talkToolbarHeight}px)`}
            >
                <TalkHeader data={singleTalkData || initialData} />
                <TalkFiles data={singleTalkData || initialData} />
            </Box>
        </>
    );
};

export default TalkWrapper;
