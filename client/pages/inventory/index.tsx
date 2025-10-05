import React from 'react';
import Head from 'next/head';
import {
    Container,
    Box,
    Typography,
    CircularProgress,
    Alert,
    Paper,
    Tooltip,
} from '@mui/material';
import { useInventoryQuery } from '@/customHooks/achievement.hooks.query';

const InventoryPage = () => {
  const { data, isLoading, isError, error } = useInventoryQuery();

  const renderContent = () => {
    if (isLoading) {
      return <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>;
    }
    if (isError) {
      return <Alert severity="error">{(error as any)?.message || "Failed to load inventory."}</Alert>;
    }
    if (!data?.inventory) {
      return <Alert severity="info">Your inventory could not be loaded.</Alert>;
    }

    const { avatars, badges } = data.inventory;

    return (
      <Box>
        {/* Avatars Section */}
        <Typography variant="h4" component="h2" gutterBottom>My Avatars</Typography>
        <Paper sx={{ p: 3, mb: 4, bgcolor: 'rgba(0,0,0,0.2)' }}>
          {avatars && avatars.length > 0 ? (
            // --- REPLACED GRID WITH BOX ---
            <Box sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(3, 1fr)',
                md: 'repeat(4, 1fr)',
                lg: 'repeat(6, 1fr)',
              }
            }}>
              {avatars.map(avatar => (
                <Box key={avatar._id} sx={{ textAlign: 'center' }}>
                  <Tooltip title={avatar.name} placement="top">
                    <Box>
                      <Box
                        component="img"
                        src={avatar.imageUrl}
                        alt={avatar.name}
                        sx={{
                          width: 100,
                          height: 100,
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid #66c0f4',
                          p: '2px',
                          bgcolor: 'common.black'
                        }}
                      />
                      <Typography variant="caption" noWrap sx={{ display: 'block', mt: 1 }}>
                        {avatar.name}
                      </Typography>
                    </Box>
                  </Tooltip>
                </Box>
              ))}
            </Box>
            // --- END OF REPLACEMENT ---
          ) : (
            <Typography sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
              You haven't collected any avatars yet.
            </Typography>
          )}
        </Paper>

        {/* Badges Section */}
        <Typography variant="h4" component="h2" gutterBottom>My Badges</Typography>
        <Paper sx={{ p: 3, bgcolor: 'rgba(0,0,0,0.2)' }}>
          {badges && badges.length > 0 ? (
            // --- REPLACED GRID WITH BOX ---
            <Box sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(3, 1fr)',
                md: 'repeat(4, 1fr)',
                lg: 'repeat(6, 1fr)',
              }
            }}>
              {badges.map(badge => (
                <Box key={badge._id} sx={{ textAlign: 'center' }}>
                  <Tooltip title={badge.description || badge.name} placement="top">
                    <Box>
                       <Box
                        component="img"
                        src={badge.image}
                        alt={badge.name}
                        sx={{
                          width: 100,
                          height: 100,
                          borderRadius: '50%',
                          objectFit: 'contain'
                        }}
                      />
                      <Typography variant="caption" noWrap sx={{ display: 'block', mt: 1 }}>
                        {badge.name}
                      </Typography>
                    </Box>
                  </Tooltip>
                </Box>
              ))}
            </Box>
            // --- END OF REPLACEMENT ---
          ) : (
            <Typography sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
              You haven't collected any badges yet.
            </Typography>
          )}
        </Paper>
      </Box>
    );
  };

  return (
    <>
      <Head><title>My Inventory | LaggedOut</title></Head>
      <Box sx={{ p: 4, bgcolor: '#1b2838', minHeight: 'calc(100vh - 64px)', color: '#c7d5e0' }}>
        <Container maxWidth="lg">
            <Typography variant="h3" component="h1" gutterBottom>My Inventory</Typography>
            {renderContent()}
        </Container>
      </Box>
    </>
  );
};

export default InventoryPage;