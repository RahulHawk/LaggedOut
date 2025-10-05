import React, { useState } from 'react';
import { Box, Typography, Avatar, Paper, Tabs, Tab, Card, CardMedia, CardContent, CircularProgress, Button } from '@mui/material';
import { DeveloperProfileData } from '@/typescript/profileTypes';
import StoreIcon from '@mui/icons-material/Store';
import CampaignIcon from '@mui/icons-material/Campaign';
import InfoIcon from '@mui/icons-material/Info';
import { useDeveloperProfileQuery } from '@/customHooks/profile.hooks.query';
import { useFollowDeveloperMutation, useUnfollowDeveloperMutation } from '@/customHooks/developer.hooks.query';

// --- 1. Define an interface for the component's props ---
interface DeveloperHeaderProps {
    profile: DeveloperProfileData;
}

// --- Sub-components for better organization ---

// --- 2. Apply the props interface to the component ---
const DeveloperHeader = ({ profile }: DeveloperHeaderProps) => {
    const { mutate: follow, isPending: isFollowing } = useFollowDeveloperMutation();
    const { mutate: unfollow, isPending: isUnfollowing } = useUnfollowDeveloperMutation(); // Fixed a minor typo here

    return (
        <Paper
            elevation={4}
            sx={{
                p: 4,
                mb: 4,
                background: 'linear-gradient(135deg, #2a3a4b 0%, #1b2838 100%)',
                color: '#fff',
                borderRadius: 2
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Avatar src={profile.profile.displayAvatar} sx={{ width: 120, height: 120, border: '4px solid #66c0f4' }} />
                    <Box>
                        <Typography variant="h3">{`${profile.firstName} ${profile.lastName}`}</Typography>
                        <Typography variant="body1">{profile.profile.bio || 'No bio provided.'}</Typography>
                    </Box>
                </Box>
                
                {profile.isFollowedByCurrentUser ? (
                    <Button variant="contained" disabled={isUnfollowing} onClick={() => unfollow(profile.id)}>Unfollow</Button>
                ) : (
                    <Button variant="outlined" disabled={isFollowing} onClick={() => follow(profile.id)}>Follow</Button>
                )}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 4, pt: 3, borderTop: '1px solid #2a3a4b' }}>
                <Box textAlign="center">
                    <Typography variant="h5" fontWeight={600}>{profile.stats.totalGames}</Typography>
                    <Typography color="text.secondary">Games Published</Typography>
                </Box>
                <Box textAlign="center">
                    <Typography variant="h5" fontWeight={600}>
                        {profile.stats.followerCount ?? 0}
                    </Typography>
                    <Typography color="text.secondary">Followers</Typography>
                </Box>
                <Box textAlign="center">
                    <Typography variant="h5" fontWeight={600}>{profile.stats.totalSales}</Typography>
                    <Typography color="text.secondary">Total Sales</Typography>
                </Box>
                <Box textAlign="center">
                    <Typography variant="h5" fontWeight={600}>{profile.stats.avgRating}</Typography>
                    <Typography color="text.secondary">Avg. Rating</Typography>
                </Box>
            </Box>
        </Paper>
    );
}

const DeveloperProfilePage = ({ id }: { id: string }) => {
    const [tab, setTab] = useState(0);
    const { data: response, isLoading, isError } = useDeveloperProfileQuery(id);

    if (isLoading) return <CircularProgress />;
    if (isError || !response) return <Typography color="error">Could not load developer profile.</Typography>;

    const profile = response.data;

    return (
        <Box>
            <DeveloperHeader profile={profile} />

            <Paper>
                <Tabs value={tab} onChange={(e, val) => setTab(val)} centered>
                    <Tab icon={<StoreIcon />} label="Games" />
                    <Tab icon={<CampaignIcon />} label="Announcements" />
                    <Tab icon={<InfoIcon />} label="About" />
                </Tabs>
                <Box p={3}>
                    {tab === 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
                            {profile.uploadedGames.map((game) => (
                                <Box key={game._id} sx={{ width: { xs: '100%', sm: '50%', md: '33.333%' }, p: 1.5 }}>
                                    <Card>
                                        <CardMedia component="img" height="140" image={game.coverImage} alt={game.title} />
                                        <CardContent>
                                            <Typography gutterBottom variant="h6">{game.title}</Typography>
                                        </CardContent>
                                    </Card>
                                </Box>
                            ))}
                        </Box>
                    )}
                    {tab === 1 && (
                         <Box>{/* Render Announcements List */}</Box>
                    )}
                    {tab === 2 && (
                        <Typography>{profile.profile.bio || 'No bio provided.'}</Typography>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};

export default DeveloperProfilePage;