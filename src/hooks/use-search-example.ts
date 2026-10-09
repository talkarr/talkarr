'use client';

import { useState } from 'react';

import { searchExamples } from '@/constants';

const useSearchExample = (): string => {
    const [randomExample] = useState<string>(() => {
        return searchExamples[
            Math.floor(Math.random() * searchExamples.length)
        ];
    });

    return randomExample;
};

export default useSearchExample;
