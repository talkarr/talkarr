import type { FC } from 'react';

import type { TypographyProps } from '@mui/material/Typography';
import Typography from '@mui/material/Typography';

const SmallText: FC<TypographyProps> = ({ children, ...props }) => (
    <Typography
        variant="body1"
        {...props}
        sx={[
            {
                fontWeight: 'bold',
                lineHeight: 1.2,
                color: 'text.secondary',
                fontSize: 10,
            },
            ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
        ]}
    >
        {children}
    </Typography>
);

export default SmallText;
