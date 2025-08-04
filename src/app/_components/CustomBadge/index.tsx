'use client';

import type { BadgeProps } from '@mui/material';

import Image from 'next/image';

import type { FC } from 'react';
import React from 'react';

import { darken, styled, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

type Size = 'small' | 'medium' | 'large';

interface CustomBadgeBaseProps extends Omit<BadgeProps, 'children'> {
    // imageUrl?: string;
    size?: Size;
    disableTitle?: boolean;
}

interface CustomBadgePropsWithImageUrl extends CustomBadgeBaseProps {
    imageUrl: string;
    icon?: never;
}

interface CustomBadgePropsWithIcon extends CustomBadgeBaseProps {
    imageUrl?: never;
    icon: React.ReactNode;
}

export type CustomBadgeProps =
    | CustomBadgePropsWithImageUrl
    | CustomBadgePropsWithIcon;

const FontSizeMap: Record<Size, number> = {
    small: 12,
    medium: 14,
    large: 16,
};

type Key = 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

const StyledBox = styled(Box, {
    shouldForwardProp(propName: PropertyKey): boolean {
        return propName !== 'badgeColor';
    },
})<{
    badgeColor: Key;
}>(({ theme, badgeColor, onClick }) => ({
    ...(onClick
        ? {
              cursor: 'pointer',
              userSelect: 'none',
              '&:hover': {
                  backgroundColor: badgeColor
                      ? darken(theme.palette[badgeColor as Key].main, 0.2)
                      : theme.palette.action.hover,
              },
              '&:focus': {
                  backgroundColor: badgeColor
                      ? darken(theme.palette[badgeColor as Key].main, 0.3)
                      : theme.palette.action.focus,
              },
              '&:active': {
                  backgroundColor: badgeColor
                      ? darken(theme.palette[badgeColor as Key].main, 0.4)
                      : theme.palette.action.selected,
              },
              transition: theme.transitions.create('background-color', {
                  duration: theme.transitions.duration.shortest,
              }),
          }
        : {}),
}));

const CustomBadge: FC<CustomBadgeProps> = ({
    color = 'primary',
    badgeContent,
    imageUrl,
    icon,
    size = 'medium',
    title,
    disableTitle,
    ...rest
}) => {
    const theme = useTheme();

    const processedColor = color === 'default' ? 'primary' : color;

    const actualColor =
        processedColor in theme.palette &&
        'main' in theme.palette[processedColor]
            ? theme.palette[processedColor].main
            : processedColor;

    return (
        <Tooltip title={disableTitle ? undefined : title} arrow>
            <StyledBox
                borderRadius={4}
                bgcolor={actualColor}
                color={theme.palette.getContrastText(actualColor)}
                badgeColor={processedColor}
                display="flex"
                alignItems="center"
                justifyContent="center"
                paddingLeft={imageUrl ? 0.5 : 1}
                paddingRight={1}
                paddingY={0.5}
                gap={1}
                height="fit-content"
                {...rest}
            >
                {imageUrl ? (
                    <Box
                        style={{
                            backgroundColor: 'white',
                            aspectRatio: '1/1',
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                        }}
                    >
                        <Box
                            style={{
                                width: 22,
                                height: 22,
                                position: 'relative',
                            }}
                        >
                            <Image
                                src={imageUrl}
                                sizes="64px"
                                alt=""
                                fill
                                style={{
                                    objectFit: 'contain',
                                    borderRadius: '50%',
                                }}
                            />
                        </Box>
                    </Box>
                ) : null}
                {icon ? (
                    <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        width={24}
                        height={24}
                        sx={{
                            '& > .MuiSvgIcon-root': {
                                color: theme.palette.getContrastText(
                                    actualColor,
                                ),
                            },
                        }}
                    >
                        {icon}
                    </Box>
                ) : null}
                <Typography
                    noWrap
                    fontSize={FontSizeMap[size]}
                    color={theme.palette.getContrastText(actualColor)}
                >
                    {badgeContent}
                </Typography>
            </StyledBox>
        </Tooltip>
    );
};

export default CustomBadge;
