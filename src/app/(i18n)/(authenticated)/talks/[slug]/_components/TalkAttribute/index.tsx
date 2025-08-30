import type { FC } from 'react';

import { useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import type { TypographyProps } from '@mui/material/Typography';
import Typography from '@mui/material/Typography';

import SmallText from '@components/SmallText';

export interface TalkAttributeProps {
    name: string;
    value: string;
    title?: string;
    color?: TypographyProps['color'] | null;
}

const TalkAttribute: FC<TalkAttributeProps> = ({
    name,
    value,
    title,
    color,
}) => {
    const theme = useTheme();

    let actualColor = color;

    if (
        color &&
        color in theme.palette &&
        typeof theme.palette[color as keyof typeof theme.palette] === 'object'
    ) {
        const palette = theme.palette[color as keyof typeof theme.palette];

        if (typeof palette === 'object' && 'main' in palette) {
            actualColor = palette.main;
        }
    }

    return (
        <Box title={title}>
            <SmallText>{name}</SmallText>
            <Box>
                <Typography
                    variant="body2"
                    lineHeight={1.2}
                    sx={{
                        borderLeft: actualColor ? '3px solid' : undefined,
                        borderColor: actualColor,
                        paddingLeft: actualColor ? 0.5 : undefined,
                    }}
                >
                    {value}
                </Typography>
            </Box>
        </Box>
    );
};

export default TalkAttribute;
