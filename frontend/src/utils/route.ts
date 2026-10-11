/* eslint-disable unicorn/no-array-reduce */
// https://github.com/vercel/next.js/discussions/56973#discussioncomment-10246582
import type { Params } from 'next/dist/server/request/params';

export const getFileRoutePath = (pathname: string, params: Params): string => {
    let paramCount = 0;
    const reverseParamsObject = Object.entries(params).reduceRight(
        (prev, [key, val]) => {
            if (Array.isArray(val)) {
                return {
                    ...prev,
                    ...val.reduceRight(
                        (_prev, cur) => {
                            // eslint-disable-next-line no-param-reassign
                            _prev[`${cur}-${paramCount}`] = `[...${key}]`;
                            paramCount += 1;
                            return _prev;
                        },
                        {} as typeof prev,
                    ),
                };
            }

            // eslint-disable-next-line no-param-reassign
            prev[`${val}-${paramCount}`] = `[${key}]`;
            paramCount += 1;
            return prev;
        },
        {} as typeof params,
    );

    let interpolateCount = 0;

    return pathname
        .split('/')
        .reduceRight((prev, cur) => {
            const lookup = reverseParamsObject[`${cur}-${interpolateCount}`];

            if (prev.endsWith(`${lookup}${'/'}`)) {
                interpolateCount += 1;
                return prev;
            }

            if (lookup) {
                // eslint-disable-next-line no-param-reassign
                prev += lookup;
                interpolateCount += 1;
            } else {
                // eslint-disable-next-line no-param-reassign
                prev += cur;
            }

            return `${prev}/`;
        }, '')
        .slice(0, -1)
        .split('/')
        .toReversed()
        .join('/');
};
