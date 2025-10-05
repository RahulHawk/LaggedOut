// src/pages/order/success.tsx

import React from 'react';
import Head from 'next/head';
import NextLink from 'next/link';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const OrderSuccessPage = () => {
    return (
        <>
            <Head>
                <title>Purchase Successful | LaggedOut</title>
            </Head>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 'calc(100vh - 64px)', // Assumes a 64px tall header
                    bgcolor: '#1b2838',
                    color: '#c7d5e0',
                    textAlign: 'center',
                }}
            >
                <Container maxWidth="sm">
                    <Paper 
                        elevation={3} 
                        sx={{ 
                            p: { xs: 3, sm: 5 }, 
                            bgcolor: '#2a475e',
                            borderRadius: 2 
                        }}
                    >
                        <CheckCircleOutlineIcon 
                            sx={{ 
                                fontSize: 80, 
                                color: 'success.main', 
                                mb: 2 
                            }} 
                        />
                        <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#fff' }}>
                            Purchase Successful!
                        </Typography>
                        <Typography sx={{ mb: 4, color: 'text.secondary' }}>
                            Thank you for your order. Your new items have been added to your library. 
                            You will receive an email confirmation shortly.
                        </Typography>
                        <NextLink href="/" passHref>
                            <Button variant="contained" size="large">
                                Back to Store
                            </Button>
                        </NextLink>
                    </Paper>
                </Container>
            </Box>
        </>
    );
};

export default OrderSuccessPage;