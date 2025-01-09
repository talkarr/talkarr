import type { CustomBadgeProps } from '@components/CustomBadge';

import { useRouter } from 'next/navigation';

import type { FC } from 'react';

import { addTalksPageWithSearchLink } from '@/constants';

import CustomBadge from '@components/CustomBadge';
import { capitalize } from '@mui/material';

export type VideoBadgeType =
    | 'tag'
    | 'speaker'
    | 'conference'
    | 'language'
    | 'date';

const colorMap = new Map<VideoBadgeType, CustomBadgeProps['color']>([
    ['conference', 'primary'],
    ['speaker', 'secondary'],
    ['language', 'info'],
    ['tag', 'success'],
    ['date', 'warning'],
]);

export interface VideoMetaBadgeProps
    extends Omit<CustomBadgeProps, 'badgeContent' | 'color'> {
    badgeContent: string;
    badgeType: VideoBadgeType;
    disableOnClick?: boolean;
}

const VideoMetaBadge: FC<VideoMetaBadgeProps> = ({
    badgeType,
    disableOnClick,
    ...props
}) => {
    const router = useRouter();
    return (
        <CustomBadge
            {...props}
            sx={{ userSelect: 'none' }}
            color={colorMap.get(badgeType)}
            title={capitalize(badgeType)}
            onClick={
                disableOnClick
                    ? undefined
                    : e => {
                          e.preventDefault();
                          e.stopPropagation();

                          router.push(
                              addTalksPageWithSearchLink(props.badgeContent),
                          );
                      }
            }
        />
    );
};

export default VideoMetaBadge;
