import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import NextLink from 'next/link';
import {
    Container,
    Box,
    Typography,
    CircularProgress,
    Alert,
    Button,
    Paper,
    Avatar,
    Divider,
} from '@mui/material';
import { useInView } from 'react-intersection-observer';

import { useGame } from '@/customHooks/game.hooks.query';
import { usePaginatedForumPosts } from '@/customHooks/forum.hooks.query';
import { Post } from '@/typescript/forumTypes';
import { PostEditorModal } from '@/components/forum/PostEditorModal';

const ForumPostSummary = ({ post }: { post: Post }) => {
    return (
        <NextLink href={`/forum/post/${post._id}`} passHref style={{ textDecoration: 'none' }}>
            <Paper sx={{
                p: 2,
                mb: 2,
                bgcolor: '#2a475e',
                color: '#c7d5e0',
                cursor: 'pointer',
                '&:hover': { bgcolor: '#3a5a7b' }
            }}>
                <Box display="flex" gap={2}>
                    <Avatar src={post.author.profile?.profilePic} />
                    <Box>
                        <Typography variant="h6" color="#fff">{post.title}</Typography>
                        <Typography variant="caption">
                            Posted by {post.author.firstName} on {new Date(post.createdAt).toLocaleDateString()}
                        </Typography>
                    </Box>
                </Box>
                <Box display="flex" justifyContent="flex-end" gap={3} mt={1}>
                    <Typography variant="body2">{post.likes.length} Likes</Typography>
                    <Typography variant="body2">{post.comments.length} Comments</Typography>
                </Box>
            </Paper>
        </NextLink>
    );
};

const GameForumPage = () => {
    const router = useRouter();
    const { gameId } = router.query;
    const { ref, inView } = useInView(); // Hook for infinite scroll

    const [isModalOpen, setIsModalOpen] = useState(false);
    // This state will hold the post we want to edit. For now, it's unused but ready for an "Edit" button.
    const [editingPost, setEditingPost] = useState<Post | null>(null);

    const handleOpenCreateModal = () => {
        setEditingPost(null); // Ensure we are in "create" mode
        setIsModalOpen(true);
    };

    const { data: gameData, isLoading: isGameLoading } = useGame(gameId as string | undefined);
    const {
        data: postsData,
        isLoading: isPostsLoading,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = usePaginatedForumPosts(gameId as string);

    // Effect to fetch next page when the trigger element is in view
    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, fetchNextPage]);

    const renderContent = () => {
        if (isPostsLoading) return <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>;
        if (isError) return <Alert severity="error">Failed to load forum posts.</Alert>;

        const posts = postsData?.pages.flatMap(page => page.posts) || [];
        if (posts.length === 0) {
            return (
                <Typography sx={{ mt: 4, textAlign: 'center', fontStyle: 'italic' }}>
                    No posts have been made in this forum yet. Be the first!
                </Typography>
            );
        }

        return (
            <Box>
                {posts.map(post => <ForumPostSummary key={post._id} post={post} />)}
                
                {/* This is the trigger to load more */}
                <Box ref={ref} sx={{ height: '50px' }}>
                    {isFetchingNextPage && <Box display="flex" justifyContent="center" p={2}><CircularProgress size={30} /></Box>}
                </Box>
            </Box>
        );
    };

    return (
        <>
            <Head><title>{gameData ? `${gameData.title} Forum` : 'Forum'} | LaggedOut</title></Head>
            <Box sx={{ p: 4, bgcolor: '#1b2838', minHeight: 'calc(100vh - 64px)', color: '#c7d5e0' }}>
                <Container maxWidth="lg">
                    {isGameLoading ? <CircularProgress size={40} /> : (
                        <Box mb={4}>
                            <Typography variant="h3" component="h1" gutterBottom>{gameData?.title} Forum</Typography>
                            {/* Update the button to open the modal */}
                            <Button variant="contained" onClick={handleOpenCreateModal}>
                                Create New Post
                            </Button>
                        </Box>
                    )}
                    <Divider sx={{ mb: 4, bgcolor: '#0f1821' }} />
                    {renderContent()}
                </Container>
            </Box>

            <PostEditorModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                gameId={gameId as string}
                postToEdit={editingPost}
            />
        </>
    );
};

export default GameForumPage;