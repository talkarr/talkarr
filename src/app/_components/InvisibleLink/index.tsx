import type { LinkProps } from 'next/link';
import Link from 'next/link';

import type { FC, HTMLAttributes } from 'react';
import React from 'react';

export type InvisibleLinkProps = LinkProps & {
    children?: React.ReactNode | undefined;
    style?: React.CSSProperties | undefined;
    tabIndex?: HTMLAttributes<HTMLAnchorElement>['tabIndex'];
};

const InvisibleLink: FC<InvisibleLinkProps> = ({
    children,
    style,
    tabIndex,
    ...props
}) => (
    <Link
        {...props}
        style={{
            ...style,
            textDecoration: 'none',
            color: 'inherit',
        }}
        tabIndex={tabIndex}
    >
        {children}
    </Link>
);

export default InvisibleLink;
