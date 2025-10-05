import React, { useState } from 'react';
import Head from 'next/head';
import { Box, Typography, Button, Stack, Paper, Card, CardContent, CardMedia, Chip, CircularProgress, Tabs, Tab } from '@mui/material';
import { useMyDeveloperProfileQuery } from '@/customHooks/profile.hooks.query';
import { useRouter } from 'next/router';
import { FollowersModal } from './FollowersModal';
import { DeveloperAvatar } from './DeveloperAvatar';
import { AnalyticsSection } from './AnalyticsSection';

export const DeveloperDashboard = () => {
    const router = useRouter();
    const [followersModalOpen, setFollowersModalOpen] = useState(false);
    const [tab, setTab] = useState(0);
    const { data: profile, isLoading, isError } = useMyDeveloperProfileQuery();

    if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
    if (isError || !profile) return <Typography color="error">Could not load developer dashboard.</Typography>;

    return (
        <>
            <Head>
                <title>Developer Dashboard | LaggedOut</title>
            </Head>
            <Box sx={{ p: 3, background: 'linear-gradient(135deg, #101820 0%, #1f2a38 100%)', minHeight: '100vh', color: 'white' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <DeveloperAvatar src={profile.profile.displayAvatar} />
                        <Typography variant="h4" fontWeight={700}>{profile.displayName}'s Dashboard</Typography>
                    </Box>
                    <Stack direction="row" spacing={2}>
                        <Button variant="contained" onClick={() => router.push(`/developer/sales`)}>Sale Management</Button>
                        <Button variant="outlined" onClick={() => setFollowersModalOpen(true)}>View Followers</Button>
                        <Button variant="contained" onClick={() => router.push(`/developer/${profile.id}`)}>View Public Profile</Button>
                    </Stack>
                </Box>

                <Tabs value={tab} onChange={(e, val) => setTab(val)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
                    <Tab label="My Games" />
                    <Tab label="Analytics" />
                </Tabs>

                {tab === 0 && (
                    <Box>
                        <Typography variant="h5" fontWeight={600} gutterBottom>My Games ({profile.uploadedGames.length})</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
                            {profile.uploadedGames.map(game => (
                                <Box key={game._id} sx={{ p: 1.5, width: { xs: '100%', sm: '50%', md: '33.333%', lg: '25%' } }}>
                                    <Card sx={{ bgcolor: '#2a475e', color: 'white' }}>
                                        <CardMedia component="img" height="160" image={game.coverImage} alt={game.title} />
                                        <CardContent>
                                            <Typography gutterBottom variant="h6">{game.title}</Typography>
                                            <Chip
                                                label={game.status === 'published' ? 'Published' : 'Pending Approval'}
                                                color={game.status === 'published' ? 'success' : 'warning'}
                                                size="small"
                                            />
                                        </CardContent>
                                    </Card>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                )}

                {tab === 1 && (
                    <AnalyticsSection />
                )}
            </Box>

            <FollowersModal
                open={followersModalOpen}
                onClose={() => setFollowersModalOpen(false)}
                developerId={profile.id}
            />
        </>
    );
};