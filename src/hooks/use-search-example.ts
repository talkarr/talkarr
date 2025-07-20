import { useEffect, useState } from 'react';

import { getSearchExample } from '@/constants';

const useSearchExample = (): string => {
    const [randomExample, setRandomExample] = useState<string>('');

    useEffect(() => {
        setRandomExample(getSearchExample());
    }, []);

    return randomExample;
};

export default useSearchExample;
