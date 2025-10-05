import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { usePlayerProfileQuery } from '@/customHooks/profile.hooks.query';
import { Container, Box, Typography, CircularProgress, Avatar, Paper } from '@mui/material';
import { PlayerProfile } from '@/typescript/profileTypes';

// --- Sub-component for a private/limited profile view ---
const LimitedProfileView = ({ profile }: { profile: PlayerProfile }) => (
    <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar src={profile.profile.displayAvatar} sx={{ width: 120, height: 120, mb: 2 }} />
        <Typography variant="h4">{profile.displayName}</Typography>
        <Typography sx={{ mt: 2, color: 'text.secondary' }}>This profile is private.</Typography>
    </Paper>
);

// --- Sub-component for a full, public profile view ---
const FullProfileView = ({ profile }: { profile: PlayerProfile }) => (
    <>
        <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 4, mb: 4 }}>
            <Avatar src={profile.profile.displayAvatar} sx={{ width: 120, height: 120 }} />
            <Box>
                <Typography variant="h4" component="h1">{profile.displayName}</Typography>
                <Typography variant="body1" color="text.secondary">{profile.profile.bio || 'No bio available.'}</Typography>
            </Box>
        </Paper>
        {profile.stats && (
             <Paper sx={{ p: 3, textAlign: 'center' }}>
                {/* --- REPLACEMENT START --- */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around' }}>
                    <Box sx={{ width: { xs: '50%', md: '25%' }, p: 1 }}>
                        <Typography><strong>{profile.stats.gamesOwned}</strong> Games</Typography>
                    </Box>
                    <Box sx={{ width: { xs: '50%', md: '25%' }, p: 1 }}>
                        <Typography><strong>{profile.stats.friendsCount}</strong> Friends</Typography>
                    </Box>
                    <Box sx={{ width: { xs: '50%', md: '25%' }, p: 1 }}>
                        <Typography><strong>{profile.stats.achievementsUnlocked}</strong> Achievements</Typography>
                    </Box>
                    <Box sx={{ width: { xs: '50%', md: '25%' }, p: 1 }}>
                        <Typography><strong>{profile.stats.wishlistCount}</strong> in Wishlist</Typography>
                    </Box>
                </Box>
                {/* --- REPLACEMENT END --- */}
            </Paper>
        )}
        {/* You can add more components here for showcase games, friends list, etc. */}
    </>
);


// --- Main Page Component ---
const PlayerProfilePage = () => {
    const router = useRouter();
    const { id } = router.query;

    const { data: response, isLoading, isError } = usePlayerProfileQuery(id as string);

    const renderContent = () => {
        if (isLoading) {
            return <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress /></Box>;
        }
        if (isError || !response) {
            return <Typography color="error">Could not load profile. The user may not exist.</Typography>;
        }

        // Check the 'limited' flag from the API response
        if (response.limited) {
            return <LimitedProfileView profile={response.data} />;
        } else {
            return <FullProfileView profile={response.data} />;
        }
    };

    const pageTitle = response?.data?.displayName ? `${response.data.displayName}'s Profile` : 'User Profile';

    return (
        <>
            <Head>
                <title>{pageTitle} | LaggedOut</title>
            </Head>
            <Container maxWidth="md" sx={{ py: 4 }}>
                {renderContent()}
            </Container>
        </>
    );
};

export default PlayerProfilePage;