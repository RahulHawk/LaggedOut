// src/customHooks/forum.hooks.query.ts

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import * as forumApi from '@/api/functions/forum.api';
import { CreatePostPayload, AddCommentPayload, Post, UpdatePostPayload } from '@/typescript/forumTypes';

const forumKeys = {
    posts: (gameId: string) => ['forum', 'posts', gameId] as const,
    post: (postId: string) => ['forum', 'post', postId] as const,
};

// --- QUERY HOOKS ---

/**
 * Hook to fetch paginated forum posts for a game.
 * This is ideal for infinite scrolling.
 */
export const usePaginatedForumPosts = (gameId: string) => {
    return useInfiniteQuery({
        queryKey: forumKeys.posts(gameId),
        queryFn: ({ pageParam = 1 }) => forumApi.getPostsPaginated({ gameId, page: pageParam }),
        getNextPageParam: (lastPage) => {
            const nextPage = lastPage.pagination.page + 1;
            return nextPage <= lastPage.pagination.totalPages ? nextPage : undefined;
        },
        initialPageParam: 1,
    });
};

/**
 * Hook to fetch details for a single forum post.
 */
export const useForumPostQuery = (postId: string) => {
    return useQuery({
        queryKey: forumKeys.post(postId),
        queryFn: () => forumApi.getPostById(postId),
        enabled: !!postId,
    });
};


// --- MUTATION HOOKS ---

export const useCreatePostMutation = (gameId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreatePostPayload) => forumApi.createPost(payload),
        onSuccess: () => {
            toast.success("Post created successfully!");
            // Refetch the list of posts for this game
            queryClient.invalidateQueries({ queryKey: forumKeys.posts(gameId) });
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Failed to create post."),
    });
};

export const useUpdatePostMutation = (gameId: string, postId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: UpdatePostPayload) => forumApi.updatePost({ postId, payload }),
        onSuccess: () => {
            toast.success("Post updated successfully!");
            // Refetch both the list of posts and the specific post detail
            queryClient.invalidateQueries({ queryKey: forumKeys.posts(gameId) });
            queryClient.invalidateQueries({ queryKey: forumKeys.post(postId) });
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Failed to update post."),
    });
};

export const useAddCommentMutation = (postId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: AddCommentPayload) => forumApi.addComment({ postId, payload }),
        onSuccess: (data) => {
            toast.success("Comment added!");
            // Update the specific post's data in the cache with the new comment list
            queryClient.setQueryData(forumKeys.post(postId), data.post);
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Failed to add comment."),
    });
};

export const useLikePostMutation = (postId: string, gameId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => forumApi.likePost(postId),
        onSuccess: (data) => {
            toast.success(data.message);
            // Invalidate queries to refetch the latest state from the server
            queryClient.invalidateQueries({ queryKey: forumKeys.post(postId) });
            queryClient.invalidateQueries({ queryKey: forumKeys.posts(gameId) });
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Action failed."),
    });
};

export const useDislikePostMutation = (postId: string, gameId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => forumApi.dislikePost(postId),
        onSuccess: (data) => {
            toast.success(data.message);
            queryClient.invalidateQueries({ queryKey: forumKeys.post(postId) });
            queryClient.invalidateQueries({ queryKey: forumKeys.posts(gameId) });
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Action failed."),
    });
};

export const useDeletePostMutation = (gameId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (postId: string) => forumApi.deletePost(postId),
        onSuccess: (data) => {
            toast.success(data.message);
            queryClient.invalidateQueries({ queryKey: forumKeys.posts(gameId) });
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Failed to delete post."),
    });
};

export const useDeleteCommentMutation = (postId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (commentId: string) => forumApi.deleteComment({ postId, commentId }),
        onSuccess: (data) => {
            toast.success(data.message);
            // Directly update the post's data with the returned post, which has the comment removed
            queryClient.setQueryData(forumKeys.post(postId), data.post);
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Failed to delete comment."),
    });
};

export const useLikeCommentMutation = (postId: string, commentId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => forumApi.likeComment({ postId, commentId }),
        onSuccess: (data) => {
            toast.success(data.message);
            // Just refetch the post to get the latest comment like counts
            queryClient.invalidateQueries({ queryKey: forumKeys.post(postId) });
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Action failed."),
    });
};

export const useDislikeCommentMutation = (postId: string, commentId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => forumApi.dislikeComment({ postId, commentId }),
        onSuccess: (data) => {
            toast.success(data.message);
            queryClient.invalidateQueries({ queryKey: forumKeys.post(postId) });
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Action failed."),
    });
};
