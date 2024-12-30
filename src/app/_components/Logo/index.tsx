import Image from 'next/image';

import type { FC } from 'react';

import LogoImage from '@/app/icon.svg';

import { pageName } from '@/constants';

export interface LogoProps {}

const Logo: FC<LogoProps> = () => (
    <Image src={LogoImage} alt={pageName} width={100} height={100} />
);

export default Logo;
