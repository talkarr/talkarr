'use client';

import type { FC } from 'react';
import React, { useEffect, useState } from 'react';

import moment from 'moment-timezone';

export interface MomentWrapperProps {
    children?: ((momentImport: typeof moment) => React.ReactNode) | undefined;
    /**
     * How often to rerender the component to update the moment value.
     *
    @default false
     */
    rerenderMs?: number | false;
}

export const MomentWrapper: FC<MomentWrapperProps> = ({
    children,
    rerenderMs = false,
}) => {
    const [, setCounter] = useState<number>(0);

    useEffect(() => {
        const interval = rerenderMs
            ? setInterval(() => {
                  setCounter(c => c + 1);
              }, rerenderMs)
            : null;

        return () => {
            if (interval !== null) {
                clearInterval(interval);
            }
        };
    }, [rerenderMs]);

    if (typeof children === 'function') {
        return <>{children(moment)}</>;
    }

    return <>{children}</>;
};

export default MomentWrapper;
