import type { CSSProperties, FC } from 'react';
import { useEffect, useState } from 'react';

export const BlurhashNotAvailableYet = 'not_available_yet' as const;

export interface CustomImageProps {
    src: string;
    blurDataURL: string | undefined;
    alt: string;
    style?: CSSProperties;
    sizes?: string;
    onLoad?: () => void;
    onError?: () => void;
    suppressHydrationWarning?: boolean;
}

const CustomImage: FC<CustomImageProps> = ({
    src,
    blurDataURL,
    alt,
    style,
    onLoad,
    onError,
    sizes,
    suppressHydrationWarning,
}) => {
    const [imageSrc, setImageSrc] = useState<string>(blurDataURL ?? src);
    const [imageLoaded, setImageLoaded] = useState<boolean>(false);

    useEffect(() => {
        setImageSrc(blurDataURL ?? src);
        setImageLoaded(false);
    }, [src, blurDataURL]);

    useEffect(() => {
        if (imageLoaded && imageSrc !== src) {
            setImageSrc(src);
        }
    }, [imageLoaded, imageSrc, src]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setImageSrc(src);
        }, 1000);

        return () => {
            clearTimeout(timeout);
        };
    }, [src]);

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={imageSrc === BlurhashNotAvailableYet ? undefined : imageSrc}
            alt={alt}
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
            onLoad={() => {
                setImageLoaded(true);
                onLoad?.();
            }}
            sizes={sizes}
            onError={() => {
                onError?.();
                if (imageSrc !== blurDataURL && blurDataURL) {
                    setImageSrc(blurDataURL);
                }
            }}
            suppressHydrationWarning={suppressHydrationWarning}
        />
    );
};

export default CustomImage;
