import Lottie from 'lottie-react';
import { Box, Typography } from '@mui/material';
import animationData from './Gibli Tribute.json'; 

export const Loading = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#1b2838', 
      }}
    >
      <Lottie
        animationData={animationData}
        loop={true}
        style={{ width: 350, height: 350 }}
      />
      <Typography variant="h6" sx={{ color: '#c7d5e0', mt: 2 }}>
        Loading...
      </Typography>
    </Box>
  );
};