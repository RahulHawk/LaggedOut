import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
    Container, Box, Typography, CircularProgress, Alert, Paper, Avatar,
    Divider, Pagination, Rating, LinearProgress
} from '@mui/material';
import { useGame } from '@/customHooks/game.hooks.query';
import { useReviewsQuery } from '@/customHooks/review.hooks.query';

const AllReviewsPage = () => {
    const router = useRouter();
    const { gameId } = router.query;
    const [page, setPage] = useState(1);

    const { data: gameData, isLoading: isGameLoading } = useGame(gameId as string | undefined);
    const { data: reviewsData, isLoading: isReviewsLoading } = useReviewsQuery({ 
        gameId: gameId as string, 
        page,
        limit: 10 // Show more reviews per page here
    });

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    const renderContent = () => {
        if (isReviewsLoading) return <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>;
        if (!reviewsData) return <Alert severity="info">No reviews found for this game.</Alert>;

        const { reviews, totalReviews, averageRating, starBreakdown, totalPages } = reviewsData;

        return (
            <Box>
                {/* Review Summary Section */}
                <Paper sx={{ p: 3, mb: 4, bgcolor: 'rgba(0,0,0,0.2)' }}>
                    <Typography variant="h5" gutterBottom>Overall Rating</Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                        <Typography variant="h2">{averageRating.toFixed(1)}</Typography>
                        <Rating value={averageRating} precision={0.1} readOnly size="large" />
                    </Box>
                    <Typography variant="body2" color="text.secondary">{totalReviews} total reviews</Typography>
                    {/* Star Breakdown */}
                    <Box mt={2}>
                        {Object.entries(starBreakdown).reverse().map(([star, count]) => (
                            <Box key={star} display="flex" alignItems="center" gap={1}>
                                <Typography variant="caption">{star} star</Typography>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={(count / totalReviews) * 100} 
                                    sx={{ flexGrow: 1, height: 8, borderRadius: 4 }} 
                                />
                                <Typography variant="caption">{count}</Typography>
                            </Box>
                        ))}
                    </Box>
                </Paper>

                {/* Reviews List */}
                {reviews.map(review => (
                    <Paper key={review._id} sx={{ p: 2, mb: 2, bgcolor: 'rgba(0,0,0,0.2)' }}>
                        <Box display="flex" gap={2}>
                            <Avatar src={review.user.profile?.profilePic} />
                            <Box>
                                <Typography color="#fff" fontWeight="bold">{review.user.name}</Typography>
                                <Rating value={review.rating} readOnly size="small" />
                            </Box>
                        </Box>
                        <Typography sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>{review.comment}</Typography>
                    </Paper>
                ))}

                <Box display="flex" justifyContent="center" mt={4}>
                    <Pagination count={totalPages} page={page} onChange={handlePageChange} />
                </Box>
            </Box>
        );
    };

    return (
        <>
            <Head><title>Reviews for {gameData?.title || 'Game'} | LaggedOut</title></Head>
            <Box sx={{ p: 4, bgcolor: '#1b2838', minHeight: 'calc(100vh - 64px)', color: '#c7d5e0' }}>
                <Container maxWidth="md">
                    <Typography variant="h3" component="h1" gutterBottom>
                        {isGameLoading ? <CircularProgress size={40} /> : `Reviews for ${gameData?.title}`}
                    </Typography>
                    <Divider sx={{ mb: 4, bgcolor: '#0f1821' }} />
                    {renderContent()}
                </Container>
            </Box>
        </>
    );
};

export default AllReviewsPage;