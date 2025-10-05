// src/customHooks/refund.hooks.query.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import * as refundApi from '@/api/functions/refund.api';
import { RequestRefundPayload, ReviewRefundPayload } from '@/typescript/refundTypes';

const refundKeys = {
    my: ['refunds', 'my'] as const,
    all: ['refunds', 'all'] as const, // For admins
};

// --- QUERY HOOKS ---

/**
 * Hook to fetch the current user's refund requests.
 */
export const useMyRefundsQuery = () => {
    return useQuery({
        queryKey: refundKeys.my,
        queryFn: async () => (await refundApi.listMyRefunds()).refunds,
    });
};

/**
 * Hook to fetch all refund requests (for admins).
 */
export const useAllRefundsQuery = () => {
    return useQuery({
        queryKey: refundKeys.all,
        queryFn: async () => (await refundApi.listAllRefunds()).refunds,
    });
};

// --- MUTATION HOOKS ---

/**
 * Hook for a player to request a refund.
 */
export const useRequestRefundMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: RequestRefundPayload) => refundApi.requestRefund(payload),
        onSuccess: (data) => {
            toast.success(data.message);
            // Refetch the user's list of refunds to show the new 'pending' request
            queryClient.invalidateQueries({ queryKey: refundKeys.my });
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Failed to request refund."),
    });
};

/**
 * Hook for an admin to approve or reject a refund.
 */
export const useReviewRefundMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ refundId, payload }: { refundId: string, payload: ReviewRefundPayload }) => 
            refundApi.reviewRefund({ refundId, payload }),
        onSuccess: (data) => {
            toast.success(data.message);
            // Refetch all refund lists
            queryClient.invalidateQueries({ queryKey: refundKeys.my });
            queryClient.invalidateQueries({ queryKey: refundKeys.all });
            // IMPORTANT: Also refetch the user's library, as an approved refund removes a game
            queryClient.invalidateQueries({ queryKey: ['library'] });
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Failed to review refund."),
    });
};