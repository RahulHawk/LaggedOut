// src/api/functions/review.api.ts

import axiosInstance from '@/api/axios/axios';
import { endpoints } from '@/api/endPoints/reviewEndpoints';
import {
    Review,
    PaginatedReviewsResponse,
    AddReviewPayload,
    UpdateReviewPayload
} from '@/typescript/reviewTypes';

export const getReviewsByGame = async ({ gameId, page = 1, limit = 4 }: { gameId: string, page?: number, limit?: number }): Promise<PaginatedReviewsResponse> => {
    const { data } = await axiosInstance.get(endpoints.review.getByGame(gameId), {
        params: { page, limit }
    });
    return data;
};

export const getUserReviewForGame = async (gameId: string): Promise<{ review: Review | null }> => {
    const { data } = await axiosInstance.get(endpoints.review.getUserReviewForGame(gameId));
    return data;
};

export const addReview = async (payload: AddReviewPayload): Promise<{ message: string, review: Review }> => {
    const { data } = await axiosInstance.post(endpoints.review.add, payload);
    return data;
};

export const updateReview = async ({ reviewId, payload }: { reviewId: string, payload: UpdateReviewPayload }): Promise<{ message: string, review: Review }> => {
    const { data } = await axiosInstance.put(endpoints.review.update(reviewId), payload);
    return data;
};

export const deleteReview = async (reviewId: string): Promise<{ message: string }> => {
    const { data } = await axiosInstance.delete(endpoints.review.delete(reviewId));
    return data;
};