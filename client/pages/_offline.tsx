import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import Head from 'next/head';

const OfflinePage = () => {
  return (
    <>
      <Head>
        <title>You're Offline | LaggedOut</title>
      </Head>
      <Container>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '80vh',
            textAlign: 'center',
            color: 'text.secondary',
          }}
        >
          <WifiOffIcon sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Connection Lost
          </Typography>
          <Typography>
            It seems you're offline. Please check your internet connection and try again.
          </Typography>
        </Box>
      </Container>
    </>
  );
};

export default OfflinePage;