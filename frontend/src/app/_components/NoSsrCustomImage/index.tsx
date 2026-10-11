import dynamic from 'next/dynamic';

const NoSsrCustomImage = dynamic(() => import('./components/CustomImage'), {
    ssr: false,
    loading: () => null,
});

export default NoSsrCustomImage;
