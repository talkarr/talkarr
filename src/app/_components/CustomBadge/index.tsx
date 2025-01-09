'use client';

import type { BadgeProps } from '@mui/material';

import Image from 'next/image';

import type { FC } from 'react';

import { darken, styled, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

type Size = 'small' | 'medium' | 'large';

export interface CustomBadgeProps extends Omit<BadgeProps, 'children'> {
    imageUrl?: string;
    size?: Size;
}

const FontSizeMap: Record<Size, number> = {
    small: 10,
    medium: 12,
    large: 14,
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
    size = 'medium',
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
                        style={{ width: 22, height: 22, position: 'relative' }}
                    >
                        <Image
                            src={imageUrl}
                            alt="badge"
                            sizes="64px"
                            fill
                            style={{
                                objectFit: 'contain',
                                borderRadius: '50%',
                            }}
                        />
                    </Box>
                </Box>
            ) : null}
            <Typography variant="body1" noWrap fontSize={FontSizeMap[size]}>
                {badgeContent}
            </Typography>
        </StyledBox>
    );
};

export default CustomBadge;
