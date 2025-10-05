// src/customHooks/friend.hooks.query.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import * as friendApi from '@/api/functions/friend.api';
import { FriendActionPayload } from '@/typescript/friendTypes';

const friendKeys = {
    allData: ['friends', 'allData'] as const,
    search: (query: string) => ['friends', 'search', query] as const,
};

// --- QUERY HOOKS ---

export const useAllFriendDataQuery = () => {
    return useQuery({
        queryKey: friendKeys.allData,
        queryFn: friendApi.getAllFriendData,
    });
};

export const useFriendSearchQuery = (query: string) => {
    return useQuery({
        queryKey: friendKeys.search(query),
        queryFn: () => friendApi.searchUsers(query),
        enabled: query.length >= 2, // Only run query if it's long enough
    });
};

// --- MUTATION HOOKS ---
// A single hook to manage all friend-related actions

export const useFriendMutations = () => {
    const queryClient = useQueryClient();

    const invalidateFriendData = () => {
        queryClient.invalidateQueries({ queryKey: friendKeys.allData });
    };

    const sendRequestMutation = useMutation({
        mutationFn: (payload: FriendActionPayload) => friendApi.sendFriendRequest(payload),
        onSuccess: (data) => { toast.success(data.message); invalidateFriendData(); },
        onError: (error: any) => toast.error(error.response?.data?.message),
    });

    const cancelRequestMutation = useMutation({
        mutationFn: (payload: FriendActionPayload) => friendApi.cancelFriendRequest(payload),
        onSuccess: (data) => { toast.info(data.message); invalidateFriendData(); },
        onError: (error: any) => toast.error(error.response?.data?.message),
    });

    const acceptRequestMutation = useMutation({
        mutationFn: (payload: FriendActionPayload) => friendApi.acceptFriendRequest(payload),
        onSuccess: (data) => { toast.success(data.message); invalidateFriendData(); },
        onError: (error: any) => toast.error(error.response?.data?.message),
    });

    const rejectRequestMutation = useMutation({
        mutationFn: (payload: FriendActionPayload) => friendApi.rejectFriendRequest(payload),
        onSuccess: (data) => { toast.info(data.message); invalidateFriendData(); },
        onError: (error: any) => toast.error(error.response?.data?.message),
    });

    const unfriendMutation = useMutation({
        mutationFn: (payload: FriendActionPayload) => friendApi.unfriendUser(payload),
        onSuccess: (data) => { toast.info(data.message); invalidateFriendData(); },
        onError: (error: any) => toast.error(error.response?.data?.message),
    });

    const blockUserMutation = useMutation({
        mutationFn: (payload: FriendActionPayload) => friendApi.blockUser(payload),
        onSuccess: (data) => { toast.warn(data.message); invalidateFriendData(); },
        onError: (error: any) => toast.error(error.response?.data?.message),
    });

    const unblockUserMutation = useMutation({
        mutationFn: (payload: FriendActionPayload) => friendApi.unblockUser(payload),
        onSuccess: (data) => { toast.success(data.message); invalidateFriendData(); },
        onError: (error: any) => toast.error(error.response?.data?.message),
    });

    return {
        sendRequest: sendRequestMutation.mutate,
        cancelRequest: cancelRequestMutation.mutate,
        acceptRequest: acceptRequestMutation.mutate,
        rejectRequest: rejectRequestMutation.mutate,
        unfriend: unfriendMutation.mutate,
        blockUser: blockUserMutation.mutate,
        unblockUser: unblockUserMutation.mutate,
    };
};