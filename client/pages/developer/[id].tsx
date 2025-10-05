import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Container, Box, Typography, CircularProgress } from '@mui/material';

import { useDeveloperProfileQuery } from '@/customHooks/profile.hooks.query';

import DeveloperProfilePage from '@/components/profile/DeveloperProfilePage';

const DeveloperPage = () => {
    const router = useRouter();
    const developerId = router.query.id as string;

    // We use the specific developer query hook here
    const { data: response, isLoading, isError } = useDeveloperProfileQuery(developerId);

    const renderContent = () => {
        if (isLoading) {
            return <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress /></Box>;
        }
        if (isError || !response) {
            return <Typography color="error">Could not load developer profile.</Typography>;
        }
        
        return <DeveloperProfilePage id={developerId} />;
    };

    const pageTitle = response?.data?.firstName ? `${response.data.firstName}'s Profile` : 'Developer Profile';

    return (
        <>
            <Head>
                <title>{pageTitle} | LaggedOut</title>
            </Head>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                {renderContent()}
            </Container>
        </>
    );
};

export default DeveloperPage;