import type { TypographyProps } from '@mui/material/Typography';

import type { FC } from 'react';

import Typography from '@mui/material/Typography';

const SmallText: FC<TypographyProps> = ({ children, ...props }) => (
    <Typography
        variant="body1"
        fontWeight="bold"
        lineHeight={1.2}
        color="text.secondary"
        fontSize={10}
        {...props}
    >
        {children}
    </Typography>
);

export default SmallText;
