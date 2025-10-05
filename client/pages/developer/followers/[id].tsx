import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Container, Box, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, CircularProgress, ListItemButton, Paper } from '@mui/material';
import { useFollowersQuery } from '@/customHooks/developer.hooks.query';
import { ProfileLink } from '@/components/common/ProfileLink';

const FollowersPage = () => {
    const router = useRouter();
    const { id } = router.query; // Get the developer ID from the URL

    const { data: followers, isLoading } = useFollowersQuery(id as string);

    return (
        <>
            <Head>
                <title>Followers | LaggedOut</title>
            </Head>
            <Container maxWidth="sm" sx={{ py: 4 }}>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Followers
                    </Typography>
                    {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        followers && followers.length > 0 ? (
                            <List>
                                {followers.map(follower => (
                                    <ProfileLink key={follower.id} user={{ _id: follower.id, role: 'player' }}>
                                        <ListItemButton>
                                            <ListItemAvatar><Avatar src={follower.avatar} /></ListItemAvatar>
                                            <ListItemText primary={follower.name} />
                                        </ListItemButton>
                                    </ProfileLink>
                                ))}
                            </List>
                        ) : (
                            <Typography sx={{ mt: 2, color: 'text.secondary', fontStyle: 'italic' }}>
                                This developer has no followers yet.
                            </Typography>
                        )
                    )}
                </Paper>
            </Container>
        </>
    );
};

export default FollowersPage;