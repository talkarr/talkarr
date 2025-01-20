import type { FC } from 'react';

import ArrowIcon from '@mui/icons-material/ArrowForwardIos';

export interface AnimatedArrowIconProps {
    open: boolean;
}

const AnimatedArrowIcon: FC<AnimatedArrowIconProps> = ({ open }) => (
    <ArrowIcon
        sx={{
            transform: open ? 'rotate(0deg)' : 'rotate(180deg)',
            transition: 'transform 0.3s',
        }}
    />
);

export default AnimatedArrowIcon;
