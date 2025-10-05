import { Box, Typography } from '@mui/material';
import Lottie from 'lottie-react';
// Import your animation JSON file
import gamingAnimation from './Gaming Now.json';

interface LoadingProps {
  message?: string;
}

export const ProfileLoading = ({ message = "Loading Profile..." }: LoadingProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#fff',
        // ✅ UPDATED STYLES
        minHeight: '100vh', // Cover the full screen height
        background: 'linear-gradient(135deg, #1f2a38 0%, #101820 100%)', // Match the site background
      }}
    >
      <Lottie 
        animationData={gamingAnimation} 
        loop={true} 
        style={{ width: '300px', height: '300px' }} 
      />
      <Typography variant="h6" sx={{ mt: 2, letterSpacing: '.1rem' }}>
        {message}
      </Typography>
    </Box>
  );
};