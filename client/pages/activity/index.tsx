import React, { useEffect } from 'react';
import Head from 'next/head';
import {
    Container,
    Box,
    Typography,
    CircularProgress,
    Alert,
    Paper,
    Avatar,
    Divider,
    Button,
} from '@mui/material';
import { useInView } from 'react-intersection-observer';
import { useActivityQuery } from '@/customHooks/activity.hooks.query';
import { Activity } from '@/typescript/activityTypes';

// Icons for different activity types
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import RateReviewIcon from '@mui/icons-material/RateReview';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

/**
 * A sub-component to render a single activity item.
 */
const ActivityItem = ({ activity }: { activity: Activity }) => {
    const getIcon = () => {
        switch (activity.type) {
            case 'purchase': return <ShoppingCartIcon />;
            case 'review': return <RateReviewIcon />;
            case 'achievement': return <EmojiEventsIcon />;
            default: return null;
        }
    };

    const getText = () => {
        switch (activity.type) {
            case 'purchase':
                return <>You purchased <strong>{activity.game?.title || 'a game'}</strong>.</>;
            case 'review':
                return <>You reviewed <strong>{activity.game?.title || 'a game'}</strong>.</>;
            case 'achievement':
                // Assuming the achievement name is stored in details
                return <>You unlocked an achievement: <strong>{activity.details?.achievementName || 'New Achievement!'}</strong></>;
            default:
                return 'An unknown activity occurred.';
        }
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
            <Avatar sx={{ bgcolor: '#3a5a7b' }}>
                {getIcon()}
            </Avatar>
            <Box flexGrow={1}>
                <Typography component="div" variant="body1">{getText()}</Typography>
                <Typography variant="caption" color="text.secondary">
                    {new Date(activity.createdAt).toLocaleString()}
                </Typography>
            </Box>
            {activity.game && (
                 <Avatar 
                    variant="square" 
                    src={activity.game.coverImage} 
                    alt={activity.game.title}
                />
            )}
        </Box>
    );
};

const ActivityFeedPage = () => {
    const { ref, inView } = useInView(); // Hook to detect when the bottom of the list is visible

    const {
        data,
        isLoading,
        isError,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useActivityQuery();

    // This effect triggers fetching the next page when the user scrolls to the bottom
    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, fetchNextPage]);

    const renderContent = () => {
        if (isLoading) {
            return <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>;
        }
        if (isError) {
            return <Alert severity="error">{(error as any)?.message || "Failed to load your activity."}</Alert>;
        }

        // We use .flatMap to turn the array of pages into a single flat array of activities
        const allActivities = data?.pages.flatMap(page => page.activities) || [];

        if (allActivities.length === 0) {
            return (
                <Typography sx={{ textAlign: 'center', fontStyle: 'italic', p: 4 }}>
                    You have no recent activity.
                </Typography>
            );
        }

        return (
            <Paper sx={{ bgcolor: 'rgba(0,0,0,0.2)' }}>
                {allActivities.map((activity, index) => (
                    <React.Fragment key={activity._id}>
                        <ActivityItem activity={activity} />
                        {index < allActivities.length - 1 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />}
                    </React.Fragment>
                ))}
            </Paper>
        );
    };

    return (
        <>
            <Head><title>My Activity | LaggedOut</title></Head>
            <Box sx={{ p: 4, bgcolor: '#1b2838', minHeight: 'calc(100vh - 64px)', color: '#c7d5e0' }}>
                <Container maxWidth="md">
                    <Typography variant="h3" component="h1" gutterBottom>My Activity Feed</Typography>
                    <Divider sx={{ mb: 4, bgcolor: '#0f1821' }} />
                    {renderContent()}

                    {/* This is the trigger element for infinite scroll */}
                    <Box ref={ref} sx={{ height: '50px', mt: 2, display: 'flex', justifyContent: 'center' }}>
                        {isFetchingNextPage ? (
                            <CircularProgress />
                        ) : hasNextPage ? (
                            // You can also have a button to manually load more
                            <Button onClick={() => fetchNextPage()}>Load More</Button>
                        ) : (
                            <Typography color="text.secondary">You've reached the end.</Typography>
                        )}
                    </Box>
                </Container>
            </Box>
        </>
    );
};

export default ActivityFeedPage;