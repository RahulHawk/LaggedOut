// src/customHooks/review.hooks.query.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import * as reviewApi from '@/api/functions/review.api';
import { AddReviewPayload, UpdateReviewPayload } from '@/typescript/reviewTypes';

const reviewKeys = {
    all: (gameId: string) => ['reviews', gameId] as const,
    userReview: (gameId: string) => ['reviews', gameId, 'user'] as const,
};

// --- QUERY HOOKS ---

export const useReviewsQuery = ({ gameId, page = 1, limit = 4 }: { gameId: string, page?: number, limit?: number }) => {
    return useQuery({
        queryKey: [...reviewKeys.all(gameId), { page, limit }],
        queryFn: () => reviewApi.getReviewsByGame({ gameId, page, limit }),
        enabled: !!gameId,
    });
};

export const useUserReviewQuery = (gameId: string) => {
    return useQuery({
        queryKey: reviewKeys.userReview(gameId),
        queryFn: () => reviewApi.getUserReviewForGame(gameId),
        enabled: !!gameId,
    });
};


// --- MUTATION HOOKS ---

const useReviewMutations = (gameId: string) => {
    const queryClient = useQueryClient();

    const invalidateQueries = () => {
        // When a review changes, we must refetch the list of reviews, the user's review,
        // and the game itself (to update the averageRating).
        queryClient.invalidateQueries({ queryKey: reviewKeys.all(gameId) });
        queryClient.invalidateQueries({ queryKey: reviewKeys.userReview(gameId) });
        queryClient.invalidateQueries({ queryKey: ['game', gameId] });
    };

    const addReviewMutation = useMutation({
        mutationFn: (payload: AddReviewPayload) => reviewApi.addReview(payload),
        onSuccess: () => {
            toast.success("Review added successfully!");
            invalidateQueries();
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Failed to add review."),
    });

    const updateReviewMutation = useMutation({
        mutationFn: ({ reviewId, payload }: { reviewId: string, payload: UpdateReviewPayload }) => 
            reviewApi.updateReview({ reviewId, payload }),
        onSuccess: () => {
            toast.success("Review updated successfully!");
            invalidateQueries();
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Failed to update review."),
    });

    const deleteReviewMutation = useMutation({
        mutationFn: (reviewId: string) => reviewApi.deleteReview(reviewId),
        onSuccess: () => {
            toast.info("Review deleted.");
            invalidateQueries();
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Failed to delete review."),
    });
    
    return {
        addReview: addReviewMutation.mutate,
        updateReview: updateReviewMutation.mutate,
        deleteReview: deleteReviewMutation.mutate,
    };
};

export default useReviewMutations;