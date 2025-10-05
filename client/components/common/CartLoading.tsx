import React from 'react';
import { Box, Typography } from '@mui/material';
import Lottie from 'lottie-react';
import cartAnimation from '@/components/common/Cart Icon Loader.json';

interface CartLoadingProps {
  message?: string;
}

export const CartLoading = ({ message = "Updating Cart..." }: CartLoadingProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#fff',
        p: 4,
      }}
    >
      <Lottie
        animationData={cartAnimation}
        loop={true}
        style={{ width: '150px', height: '150px' }}
      />
      <Typography variant="h6" sx={{ mt: 2, letterSpacing: '.1rem' }}>
        {message}
      </Typography>
    </Box>
  );
};