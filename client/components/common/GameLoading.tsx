import React from 'react';
import { Box, Typography, Fade } from '@mui/material';
import Lottie from 'lottie-react';
import gamerAnimation from '@/components/common/PUBG.json';

interface LoadingScreenProps {
  isLoading: boolean;
}

export const GameLoading = ({ isLoading }: LoadingScreenProps) => {
  return (
    <Fade in={isLoading} timeout={300} unmountOnExit>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#1b2838',
          zIndex: 9999,
          color: '#c7d5e0',
        }}
      >
        {/* ✅ Use the props from your working example */}
        <Lottie 
          animationData={gamerAnimation} 
          loop={true} 
          style={{ width: 300, height: 300, marginBottom: 2 }}
        />
        <Typography variant="h6" sx={{ letterSpacing: '0.1rem' }}>
          LOADING GAME...
        </Typography>
      </Box>
    </Fade>
  );
};