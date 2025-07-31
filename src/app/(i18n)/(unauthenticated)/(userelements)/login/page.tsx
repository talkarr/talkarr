import type { NextPage } from 'next';

import LoginPageForm from '@/app/(i18n)/(unauthenticated)/(userelements)/login/_components/LoginPageForm';

import Typography from '@mui/material/Typography';

const Page: NextPage = () => (
    <>
        <Typography variant="h2">Login Page</Typography>
        <Typography variant="body1">
            Please enter your credentials to log in.
        </Typography>
        <LoginPageForm />
    </>
);

export default Page;
