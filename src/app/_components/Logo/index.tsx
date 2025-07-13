import Image from 'next/image';

import type { FC } from 'react';

import LogoImage from '@/app/icon.svg';

import { pageName } from '@/constants';

export interface LogoProps {
    width?: number;
    height?: number;
}

const Logo: FC<LogoProps> = ({ width = 100, height = 100 }) => (
    <Image src={LogoImage} alt={pageName} width={width} height={height} />
);

export default Logo;
