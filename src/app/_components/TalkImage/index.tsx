'use client';

import Image from 'next/image';

import type { CSSProperties, FC } from 'react';
import { useEffect, useState } from 'react';

import { useTheme } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';

import type { SingleTalkData } from '@/app/(i18n)/(authenticated)/talks/[slug]/page';
// eslint-disable-next-line import/no-cycle
import {
    searchItemMaxImageWidth,
    searchItemMinHeight,
} from '@/app/(i18n)/(authenticated)/talks/add/_components/SearchItem';

import { generateCacheUrl } from '@/utils/cache';

import type { TalkData } from '@/stores/ui-store';

import ImageFallback from '@components/ImageFallback';

export interface TalkImageProps {
    data: TalkData | SingleTalkData['db'] | undefined;
    maxWidth?: CSSProperties['maxWidth'];
    height?: CSSProperties['height'];
    maxHeight?: CSSProperties['maxHeight'];
}

const TalkImage: FC<TalkImageProps> = ({
    data,
    maxWidth,
    height,
    maxHeight,
}) => {
    const theme = useTheme();

    const [showFallback, setShowFallback] = useState<boolean>(false);
    const [imageLoading, setImageLoading] = useState<boolean>(true);

    useEffect(() => {
        setShowFallback(false);
    }, [data]);

    if (!data) {
        return null;
    }

    const blurHash = 'poster_url_blur' in data ? data.poster_url_blur : null;

    return (
        <div
            style={{
                position: 'relative',
                maxWidth: maxWidth ?? `${searchItemMaxImageWidth}px`,
                height: height ?? `${searchItemMinHeight}px`,
                maxHeight: maxHeight ?? undefined,
                aspectRatio: '16 / 9',
                borderRadius: theme.shape.borderRadius * 2,
                overflow: 'hidden',
            }}
        >
            {showFallback ? (
                <ImageFallback />
            ) : (
                <>
                    {imageLoading ? (
                        <Skeleton
                            variant="rectangular"
                            width={maxWidth}
                            height={maxHeight ?? searchItemMinHeight}
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                borderRadius: '4px',
                            }}
                        />
                    ) : null}
                    <Image
                        src={generateCacheUrl({
                            url: data.poster_url,
                            cacheKey: `poster-${data.guid}`,
                        })}
                        placeholder={blurHash ? 'blur' : undefined}
                        blurDataURL={blurHash ?? undefined}
                        alt={data.title}
                        title={data.title}
                        sizes="300px"
                        fill
                        style={{
                            objectFit: 'contain',
                        }}
                        priority
                        onLoad={event => {
                            setImageLoading(false);

                            if (
                                (event.target as HTMLImageElement)
                                    .naturalWidth === 0
                            ) {
                                setShowFallback(true);
                            }
                        }}
                        onError={() => setShowFallback(true)}
                    />
                </>
            )}
        </div>
    );
};

export default TalkImage;
