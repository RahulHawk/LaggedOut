import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/customHooks/auth.hooks.query';
import { Box, CircularProgress } from '@mui/material';

// Import your TWO different dashboard UIs
import PlayerProfile from '@/components/profile/PlayerProfile'; // Your original player profile UI
import { DeveloperDashboard } from '@/components/profile/DeveloperDashboard'; // The new developer UI

const MyProfilePage = () => {
  const { user, isLoggedIn, isLoading } = useAuth();

  // While we wait for the user data (which includes the role), show a loader
  if (isLoading || !isLoggedIn) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Once we have the user, check their role and render the correct component
  if (user?.role === 'developer') {
    return <DeveloperDashboard />;
  } else {
    return <PlayerProfile />;
  }
};

export default MyProfilePage;