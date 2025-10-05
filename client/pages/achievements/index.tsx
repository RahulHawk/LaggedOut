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
    Divider,
} from '@mui/material';
import { useAchievementsStatusQuery } from '@/customHooks/achievement.hooks.query';
import LockIcon from '@mui/icons-material/Lock'; // Icon for unearned achievements

const AchievementsPage = () => {
  const { data, isLoading, isError, error } = useAchievementsStatusQuery();

  const renderContent = () => {
    if (isLoading) {
      return <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>;
    }
    if (isError) {
      return <Alert severity="error">{(error as any)?.message || "Failed to load achievements."}</Alert>;
    }
    if (!data?.allAchievements || data.allAchievements.length === 0) {
      return <Alert severity="info">There are no achievements to display yet.</Alert>;
    }

    const { allAchievements } = data;

    return (
      <Paper sx={{ p: { xs: 2, md: 3 }, bgcolor: 'rgba(0,0,0,0.2)' }}>
        <Box sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(3, 1fr)',
            md: 'repeat(5, 1fr)',
            lg: 'repeat(7, 1fr)',
          }
        }}>
          {allAchievements.map(achievement => {
            const hasBadge = !!achievement.badge;

            return (
              <Tooltip 
                key={achievement.id}
                title={
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{achievement.name}</Typography>
                    <Typography variant="caption">{achievement.description}</Typography>
                    {!achievement.earned && <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'error.main' }}>LOCKED</Typography>}
                  </Box>
                }
                placement="top"
                arrow
              >
                <Box sx={{
                  textAlign: 'center',
                  // Apply grayscale and opacity if the achievement is not earned
                  ...(!achievement.earned && {
                    filter: 'grayscale(100%)',
                    opacity: 0.5,
                  }),
                }}>
                  <Box
                    component="img"
                    src={hasBadge ? achievement.badge?.image : '/default-badge.png'} // Provide a default image
                    alt={achievement.name}
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      objectFit: 'contain',
                      bgcolor: 'rgba(0,0,0,0.4)',
                      p: '4px'
                    }}
                  />
                  <Typography variant="caption" noWrap sx={{ display: 'block', mt: 1, fontWeight: 'bold' }}>
                    {achievement.name}
                  </Typography>
                </Box>
              </Tooltip>
            );
          })}
        </Box>
      </Paper>
    );
  };

  return (
    <>
      <Head><title>Achievements | LaggedOut</title></Head>
      <Box sx={{ p: 4, bgcolor: '#1b2838', minHeight: 'calc(100vh - 64px)', color: '#c7d5e0' }}>
        <Container maxWidth="lg">
            <Typography variant="h3" component="h1" gutterBottom>All Achievements</Typography>
            <Divider sx={{ mb: 4, bgcolor: '#0f1821' }} />
            {renderContent()}
        </Container>
      </Box>
    </>
  );
};

export default AchievementsPage;