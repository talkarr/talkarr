'use client';

import Image from 'next/image';

import type { FC } from 'react';

import type { BadgeProps } from '@mui/material';
import { useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export interface CustomBadgeProps extends Omit<BadgeProps, 'children'> {
    imageUrl?: string;
}

const CustomBadge: FC<CustomBadgeProps> = ({
    color = 'primary',
    badgeContent,
    imageUrl,
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
        <Box
            borderRadius={4}
            bgcolor={actualColor}
            color={theme.palette.getContrastText(actualColor)}
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
                    <Box style={{ width: 22, height: 22 }}>
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
            <Typography variant="body1" noWrap>
                {badgeContent}
            </Typography>
        </Box>
    );
};

export default CustomBadge;
