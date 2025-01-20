import type { LinkProps } from 'next/link';
import Link from 'next/link';

import type { FC } from 'react';
import React from 'react';

export type InvisibleLinkProps = LinkProps & {
    children?: React.ReactNode | undefined;
    style?: React.CSSProperties | undefined;
};

const InvisibleLink: FC<InvisibleLinkProps> = ({
    children,
    style,
    ...props
}) => (
    <Link
        {...props}
        style={{
            ...style,
            textDecoration: 'none',
            color: 'inherit',
        }}
    >
        {children}
    </Link>
);

export default InvisibleLink;
