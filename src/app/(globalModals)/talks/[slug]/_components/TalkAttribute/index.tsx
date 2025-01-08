import type { TypographyProps } from '@mui/material/Typography';

import type { FC } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export interface TalkAttributeProps {
    name: string;
    value: string;
    title?: string;
    color?: TypographyProps['color'];
}

const TalkAttribute: FC<TalkAttributeProps> = ({
    name,
    value,
    title,
    color,
}) => (
    <Box title={title}>
        <Typography
            variant="body1"
            fontWeight="bold"
            lineHeight={1.2}
            color="text.secondary"
            fontSize={10}
        >
            {name}
        </Typography>
        <Typography variant="body2" lineHeight={1.2} color={color}>
            {value}
        </Typography>
    </Box>
);

export default TalkAttribute;
