import type { TypographyProps } from '@mui/material/Typography';

import type { FC } from 'react';

import SmallText from '@components/SmallText';
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
        <SmallText>{name}</SmallText>
        <Typography variant="body2" lineHeight={1.2} color={color}>
            {value}
        </Typography>
    </Box>
);

export default TalkAttribute;
