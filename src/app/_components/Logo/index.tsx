'use client';

import Image from 'next/image';

import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import LogoImage from '@/app/icon.svg';

export interface LogoProps {
    width?: number;
    height?: number;
}

const Logo: FC<LogoProps> = ({ width = 100, height = 100 }) => {
    const { t } = useTranslation();

    return (
        <Image
            src={LogoImage}
            alt={t('application.name')}
            width={width}
            height={height}
        />
    );
};

export default Logo;
