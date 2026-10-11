'use client';

import { useEffect, useState } from 'react';

import { searchExamples } from '@/constants';

const useSearchExample = (): string => {
    const [randomExample, setRandomExample] = useState<string>('');

    useEffect(() => {
        const example =
            searchExamples[Math.floor(Math.random() * searchExamples.length)];

        setRandomExample(example);
    }, []);

    return randomExample;
};

export default useSearchExample;
