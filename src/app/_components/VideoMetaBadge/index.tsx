'use client';

import type { CustomBadgeProps } from '@components/CustomBadge';
import type { TFunction } from 'i18next';

import { useRouter } from 'next/navigation';

import type { FC } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { addTalksPageWithSearchLink } from '@/constants';

import CustomBadge from '@components/CustomBadge';

// Info: When updating this, also update the translation keys!
export type VideoBadgeType =
    | 'tag'
    | 'speaker'
    | 'conference'
    | 'language'
    | 'date'
    | 'duration';

export const videoBadgeTypeToString = (
    type: VideoBadgeType,
    disableOnClick: boolean | undefined,
    t: TFunction,
): string =>
    ['duration'].includes(type)
        ? type
        : t(
              disableOnClick
                  ? `enums.videoBadgeType.${type}.default`
                  : `enums.videoBadgeType.${type}.action`,
              {
                  defaultValue: type,
              },
          );

const colorMap = new Map<VideoBadgeType, CustomBadgeProps['color']>([
    ['conference', 'primary'],
    ['speaker', 'secondary'],
    ['language', 'info'],
    ['tag', 'success'],
    ['date', 'warning'],
    ['duration', 'warning'],
]);

export interface VideoMetaBadgeProps extends Omit<
    CustomBadgeProps,
    'badgeContent' | 'color'
> {
    badgeContent: React.ReactNode;
    badgeType: VideoBadgeType;
    disableOnClick?: boolean;
}

const VideoMetaBadge: FC<VideoMetaBadgeProps> = ({
    badgeType,
    disableOnClick,
    imageUrl,
    icon,
    ...props
}) => {
    const { t } = useTranslation();
    const router = useRouter();
    return (
        <CustomBadge
            color={colorMap.get(badgeType)}
            title={videoBadgeTypeToString(badgeType, disableOnClick, t)}
            imageUrl={imageUrl as never}
            icon={icon as never}
            {...props}
            sx={{ ...props.sx, userSelect: 'none' }}
            onClick={
                disableOnClick
                    ? undefined
                    : e => {
                          e.preventDefault();
                          e.stopPropagation();

                          if (typeof props.badgeContent === 'string') {
                              router.push(
                                  addTalksPageWithSearchLink(
                                      props.badgeContent,
                                  ),
                              );
                          }
                      }
            }
            data-testid="video-meta-badge"
            data-badge-type={badgeType}
        />
    );
};

export default VideoMetaBadge;
