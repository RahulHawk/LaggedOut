// src/api/functions/forum.api.ts

import axiosInstance from '@/api/axios/axios';
import { endpoints } from '@/api/endPoints/forumEndpoints';
import {
    Post,
    PaginatedPostsResponse,
    CreatePostPayload,
    UpdatePostPayload,
    AddCommentPayload,
    LikeDislikeResponse
} from '@/typescript/forumTypes';

// --- POSTS ---

export const createPost = async (payload: CreatePostPayload): Promise<{ message: string, post: Post }> => {
    const { data } = await axiosInstance.post(endpoints.forum.createPost, payload);
    return data;
};

export const getPostsPaginated = async ({ gameId, page = 1, limit = 10 }: { gameId: string, page?: number, limit?: number }): Promise<PaginatedPostsResponse> => {
    const { data } = await axiosInstance.get(endpoints.forum.getPostsPaginated(gameId), {
        params: { page, limit }
    });
    return data;
};

export const getPostById = async (postId: string): Promise<Post> => {
    const { data } = await axiosInstance.get(endpoints.forum.getPostById(postId));
    return data;
};

export const updatePost = async ({ postId, payload }: { postId: string, payload: UpdatePostPayload }): Promise<{ message: string, post: Post }> => {
    const { data } = await axiosInstance.put(endpoints.forum.updatePost(postId), payload);
    return data;
};

export const deletePost = async (postId: string): Promise<{ message: string }> => {
    const { data } = await axiosInstance.delete(endpoints.forum.deletePost(postId));
    return data;
};

export const likePost = async (postId: string): Promise<LikeDislikeResponse> => {
    const { data } = await axiosInstance.post(endpoints.forum.likePost(postId));
    return data;
};

export const dislikePost = async (postId: string): Promise<LikeDislikeResponse> => {
    const { data } = await axiosInstance.post(endpoints.forum.dislikePost(postId));
    return data;
};


// --- COMMENTS ---

export const addComment = async ({ postId, payload }: { postId: string, payload: AddCommentPayload }): Promise<{ message: string, post: Post }> => {
    const { data } = await axiosInstance.post(endpoints.forum.addComment(postId), payload);
    return data;
};

export const deleteComment = async ({ postId, commentId }: { postId: string, commentId: string }): Promise<{ message: string, post: Post }> => {
    const { data } = await axiosInstance.delete(endpoints.forum.deleteComment(postId, commentId));
    return data;
};

export const likeComment = async ({ postId, commentId }: { postId: string, commentId: string }): Promise<LikeDislikeResponse> => {
    const { data } = await axiosInstance.post(endpoints.forum.likeComment(postId, commentId));
    return data;
};

export const dislikeComment = async ({ postId, commentId }: { postId: string, commentId: string }): Promise<LikeDislikeResponse> => {
    const { data } = await axiosInstance.post(endpoints.forum.dislikeComment(postId, commentId));
    return data;
};