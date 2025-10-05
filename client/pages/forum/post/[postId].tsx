import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
    Container, Box, Typography, CircularProgress, Alert, Button, Paper, Avatar, Divider, TextField, IconButton
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import { useAuth } from '@/customHooks/auth.hooks.query';
import {
    useForumPostQuery,
    useAddCommentMutation,
    useLikePostMutation,
    useDislikePostMutation,
    useDeletePostMutation,
    useLikeCommentMutation,
    useDislikeCommentMutation,
    useDeleteCommentMutation
} from '@/customHooks/forum.hooks.query';
import { Comment } from '@/typescript/forumTypes';

const PostDetailPage = () => {
    const router = useRouter();
    const { postId } = router.query;
    const { user } = useAuth(); // Get the current logged-in user

    const [commentText, setCommentText] = useState('');

    // --- Data Fetching & Mutations ---
    const { data: post, isLoading, isError, error } = useForumPostQuery(postId as string);
    const gameId = post?.game || ''; // Needed for invalidating the post list

    const { mutate: addComment, isPending: isAddingComment } = useAddCommentMutation(postId as string);
    const { mutate: likePost } = useLikePostMutation(postId as string, gameId);
    const { mutate: dislikePost } = useDislikePostMutation(postId as string, gameId);
    const { mutate: deletePost } = useDeletePostMutation(gameId);
    const { mutate: deleteComment } = useDeleteCommentMutation(postId as string);

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        addComment({ text: commentText }, {
            onSuccess: () => setCommentText('') // Clear input on success
        });
    };

    const handleDeletePost = () => {
        if (window.confirm("Are you sure you want to delete this post? This cannot be undone.")) {
            deletePost(postId as string, {
                onSuccess: () => router.push(`/forum/game/${gameId}`) // Go back to the game forum on success
            });
        }
    };

    const renderContent = () => {
        if (isLoading) return <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>;
        if (isError) return <Alert severity="error">{(error as Error)?.message || "Failed to load post."}</Alert>;
        if (!post) return <Alert severity="warning">Post not found.</Alert>;

        const userHasLiked = user && post.likes.includes(user.id);
        const userHasDisliked = user && post.dislikes.includes(user.id);

        return (
            <Box>
                {/* --- Main Post Display --- */}
                <Paper sx={{ p: 3, bgcolor: '#2a475e', color: '#c7d5e0' }}>
                    <Box display="flex" gap={2} mb={2}>
                        <Avatar src={post.author.profile?.profilePic} />
                        <Box>
                            <Typography variant="caption">
                                Posted by {post.author.firstName} on {new Date(post.createdAt).toLocaleString()}
                            </Typography>
                        </Box>
                    </Box>
                    <Typography variant="h4" component="h1" gutterBottom color="#fff">{post.title}</Typography>
                    <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />
                    <Typography sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{post.content}</Typography>

                    {/* --- Post Action Buttons --- */}
                    <Box display="flex" alignItems="center" gap={1} mt={3}>
                        <IconButton onClick={() => likePost()} color={userHasLiked ? 'primary' : 'default'}><ThumbUpIcon /></IconButton>
                        <Typography>{post.likes.length}</Typography>
                        <IconButton onClick={() => dislikePost()} color={userHasDisliked ? 'error' : 'default'}><ThumbDownIcon /></IconButton>
                        <Typography>{post.dislikes.length}</Typography>

                        {/* Show edit/delete buttons only to the author */}
                        {user?.id === post.author._id && (
                            <Box sx={{ ml: 'auto' }}>
                                <IconButton><EditIcon /></IconButton>
                                <IconButton onClick={handleDeletePost}><DeleteIcon /></IconButton>
                            </Box>
                        )}
                    </Box>
                </Paper>

                {/* --- Add Comment Form --- */}
                <Paper sx={{ p: 2, mt: 4, bgcolor: '#2a475e' }}>
                    <Typography variant="h6" gutterBottom>Leave a Comment</Typography>
                    <form onSubmit={handleCommentSubmit}>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            variant="outlined"
                            placeholder="Write your comment here..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(0,0,0,0.2)' } }}
                        />
                        <Button type="submit" variant="contained" sx={{ mt: 2 }} disabled={isAddingComment}>
                            {isAddingComment ? <CircularProgress size={24} /> : "Post Comment"}
                        </Button>
                    </form>
                </Paper>

                {/* --- Comments List --- */}
                <Box mt={4}>
                    <Typography variant="h5" gutterBottom>{post.comments.length} Comments</Typography>
                    {post.comments.map(comment => (
                        <CommentItem key={comment._id} postId={post._id} comment={comment} postAuthorId={post.author._id} />
                    ))}
                </Box>
            </Box>
        );
    };

    return (
        <>
            <Head><title>{post?.title || 'Forum Post'} | LaggedOut</title></Head>
            <Box sx={{ p: 4, bgcolor: '#1b2838', minHeight: 'calc(100vh - 64px)', color: '#c7d5e0' }}>
                <Container maxWidth="md">
                    {renderContent()}
                </Container>
            </Box>
        </>
    );
};

// A sub-component for displaying a single comment with its own actions
const CommentItem = ({ postId, comment, postAuthorId }: { postId: string, comment: Comment, postAuthorId: string }) => {
    const { user } = useAuth();
    const { mutate: likeComment } = useLikeCommentMutation(postId, comment._id);
    const { mutate: dislikeComment } = useDislikeCommentMutation(postId, comment._id);
    const { mutate: deleteComment } = useDeleteCommentMutation(postId);

    const canDelete = user && (user.id === comment.user._id || user.id === postAuthorId);
    const hasLiked = user && comment.likes.includes(user.id);
    const hasDisliked = user && comment.dislikes.includes(user.id);

    return (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'rgba(0,0,0,0.2)' }}>
            <Box display="flex" gap={2}>
                <Avatar src={comment.user.profile?.profilePic} />
                <Box flexGrow={1}>
                    <Typography variant="body2" color="#fff" fontWeight="bold">{comment.user.firstName}</Typography>
                    <Typography variant="caption" color="text.secondary">{new Date(comment.createdAt).toLocaleString()}</Typography>
                    <Typography sx={{ mt: 1 }}>{comment.text}</Typography>
                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                        <IconButton size="small" onClick={() => likeComment()} color={hasLiked ? 'primary' : 'default'}><ThumbUpIcon fontSize="inherit" /></IconButton>
                        <Typography variant="body2">{comment.likes.length}</Typography>
                        <IconButton size="small" onClick={() => dislikeComment()} color={hasDisliked ? 'error' : 'default'}><ThumbDownIcon fontSize="inherit" /></IconButton>
                        <Typography variant="body2">{comment.dislikes.length}</Typography>
                        {canDelete && (
                            <IconButton size="small" sx={{ ml: 'auto' }} onClick={() => deleteComment(comment._id)}>
                                <DeleteIcon fontSize="inherit" />
                            </IconButton>
                        )}
                    </Box>
                </Box>
            </Box>
        </Paper>
    );
}

export default PostDetailPage;