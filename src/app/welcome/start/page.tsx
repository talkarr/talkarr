import type { NextPage } from 'next';

import InitialAccountForm from '@/app/welcome/start/_components/InitialAccountForm';

import Typography from '@mui/material/Typography';

const Page: NextPage = () => (
    <>
        <Typography variant="h4" textAlign="center">
            Setup your initial account
        </Typography>
        <Typography variant="body2" textAlign="center">
            This account will have admin privileges. Note, that you must have at
            least one admin account registered.
        </Typography>
        <InitialAccountForm />
    </>
);

export default Page;
