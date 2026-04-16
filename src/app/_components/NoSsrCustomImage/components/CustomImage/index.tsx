import type React from 'react';
import type { CSSProperties, FC } from 'react';
import { useEffect, useState } from 'react';

export const BlurhashNotAvailableYet = 'not_available_yet' as const;

export interface CustomImageProps {
    src: string;
    alt: string;
    title?: string;
    blurDataURL?: string | undefined;
    style?: CSSProperties;
    sizes?: string;
    onLoad?: (event?: React.SyntheticEvent<HTMLImageElement>) => void;
    onLoadStart?: () => void;
    onError?: () => void;
    suppressHydrationWarning?: boolean;
}

const CustomImage: FC<CustomImageProps> = ({
    src,
    blurDataURL,
    alt,
    title,
    style,
    onLoad,
    onError,
    sizes,
    suppressHydrationWarning,
    onLoadStart,
}) => {
    const [imageSrc, setImageSrc] = useState<string>(src);
    const [imageError, setImageError] = useState<boolean>(false);
    const [imageLoaded, setImageLoaded] = useState<boolean>(false);

    useEffect(() => {
        if (src) {
            onLoadStart?.();
            const img = new Image();
            img.onerror = () => {
                setImageError(true);
            };
            img.src = src;

            setImageLoaded(false);

            // If img.complete is true, this means either insanely fast internet,
            // or more likely the image is cached by the browser
            if (img.complete) {
                setImageSrc(src);
                setImageLoaded(true);
                onLoad?.();
            } else if (blurDataURL) {
                setImageSrc(blurDataURL);
            }
        }
    }, [blurDataURL, src, onLoad, onLoadStart]);

    useEffect(() => {
        if (imageLoaded && imageSrc !== src && !imageError) {
            setImageSrc(src);
        }
    }, [imageError, imageLoaded, imageSrc, src]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (imageSrc !== src) {
                setImageSrc(src);
            }
        }, 1000);

        return () => {
            clearTimeout(timeout);
        };
    }, [src, imageSrc]);

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={imageSrc === BlurhashNotAvailableYet ? undefined : imageSrc}
            alt={alt}
            title={title}
            style={{
                ...style,
                objectFit: 'cover',
                width: '100%',
                height: '100%',
                display: 'block',
                transition: 'filter 0.3s ease-in-out',
                filter: imageSrc === blurDataURL ? 'blur(8px)' : 'none',
            }}
            draggable={false}
            decoding="async"
            onLoadStart={onLoadStart}
            onLoad={event => {
                if (!imageLoaded) {
                    setImageLoaded(true);
                }
                onLoad?.(event);
            }}
            sizes={sizes}
            onError={() => {
                onError?.();
                setImageError(true);
                if (imageSrc !== blurDataURL && blurDataURL) {
                    setImageSrc(blurDataURL);
                }
            }}
            suppressHydrationWarning={suppressHydrationWarning}
        />
    );
};

export default CustomImage;
