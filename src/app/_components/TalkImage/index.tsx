import Image from 'next/image';

import type { CSSProperties, FC } from 'react';
import { useEffect, useState } from 'react';

// eslint-disable-next-line import/no-cycle
import {
    searchItemMaxImageWidth,
    searchItemMinHeight,
} from '@/app/(globalModals)/talks/add/_components/SearchItem';

import type { TalkData } from '@/stores/uiStore';

import ImageFallback from '@components/ImageFallback';
import Skeleton from '@mui/material/Skeleton';

export interface TalkImageProps {
    data?: TalkData;
    maxWidth?: CSSProperties['maxWidth'];
    maxHeight?: CSSProperties['maxHeight'];
}

const TalkImage: FC<TalkImageProps> = ({ data, maxWidth, maxHeight }) => {
    const [showFallback, setShowFallback] = useState<boolean>(false);
    const [imageLoading, setImageLoading] = useState<boolean>(true);

    useEffect(() => {
        setShowFallback(false);
    }, [data]);

    if (!data) {
        return null;
    }

    return (
        <div
            style={{
                position: 'relative',
                maxWidth: maxWidth ?? `${searchItemMaxImageWidth}px`,
                height: maxHeight ?? `${searchItemMinHeight}px`,
                aspectRatio: '16 / 9',
                borderRadius: '4px',
                overflow: 'hidden',
            }}
        >
            {showFallback ? (
                <ImageFallback />
            ) : (
                <>
                    <Image
                        src={data.poster_url}
                        alt={data.title}
                        sizes="300px"
                        fill
                        style={{ objectFit: 'contain' }}
                        onLoadingComplete={res => {
                            if (res.naturalWidth === 0) {
                                setShowFallback(true);
                            }
                            setImageLoading(false);
                        }}
                        onError={() => setShowFallback(true)}
                    />
                    {imageLoading ? (
                        <Skeleton
                            variant="rectangular"
                            width={maxWidth}
                            height={searchItemMinHeight}
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                borderRadius: '4px',
                            }}
                        />
                    ) : null}
                </>
            )}
        </div>
    );
};

export default TalkImage;
