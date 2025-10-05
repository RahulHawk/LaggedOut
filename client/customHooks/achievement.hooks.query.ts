// src/customHooks/achievement.hooks.query.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import * as achievementApi from '@/api/functions/achievement.api';
import { CreateAchievementPayload } from '@/typescript/achievementTypes';

// --- Query Hooks (for Players) ---

/**
 * Hook to fetch the user's inventory data.
 */
export const useInventoryQuery = () => {
    return useQuery({
        queryKey: ['inventory'],
        queryFn: achievementApi.getInventory,
    });
};

/**
 * Hook to fetch the status of all achievements for the current user.
 */
export const useAchievementsStatusQuery = () => {
    return useQuery({
        queryKey: ['achievements', 'status'],
        queryFn: achievementApi.getAllAndMyAchievements,
    });
};

export const useListAllAchievementsQuery = () => {
    return useQuery({
        queryKey: ['achievements'],
        queryFn: achievementApi.listAllAchievements,
        select: (response) => response.achievements || [],
    });
};

// --- Mutation Hooks (for Admins) ---

/**
 * Hook for the "Create Badge" admin action.
 */
export const useCreateBadgeMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: FormData) => achievementApi.createBadge(payload),
        onSuccess: (data) => {
            toast.success(data.message || "Badge created successfully!");
            // Optionally refetch achievements if they might be affected
            queryClient.invalidateQueries({ queryKey: ['achievements'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to create badge.");
        }
    });
};

/**
 * Hook for the "Create Achievement" admin action.
 */
export const useCreateAchievementMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateAchievementPayload) => achievementApi.createAchievement(payload),
        onSuccess: () => {
            toast.success("Achievement created successfully!");
            // Refetch the achievement status list so admins see the new one
            queryClient.invalidateQueries({ queryKey: ['achievements', 'status'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to create achievement.");
        }
    });
};