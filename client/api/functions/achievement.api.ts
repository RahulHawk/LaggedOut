// src/api/functions/achievement.api.ts

import axiosInstance from '@/api/axios/axios';
import { endpoints } from '@/api/endPoints/achievements.endPoints';
import {
    Inventory,
    Achievement,
    Badge,
    AllAndMyAchievementsResponse,
    CreateAchievementPayload
} from '@/typescript/achievementTypes';

// --- User-Facing API Calls ---

/**
 * Fetches the current user's inventory (avatars and badges).
 */
export const getInventory = async (): Promise<{ inventory: Inventory }> => {
    const { data } = await axiosInstance.get(endpoints.inventory.get);
    return data;
};

/**
 * Fetches all achievements and marks which ones the current user has earned.
 */
export const getAllAndMyAchievements = async (): Promise<AllAndMyAchievementsResponse> => {
    const { data } = await axiosInstance.get(endpoints.achievement.listUserStatus);
    return data;
};


// --- Admin-Only API Calls ---

/**
 * Creates a new badge. Requires multipart/form-data for the image.
 * @param payload - A FormData object containing 'name', 'description', and 'image' file.
 */
export const createBadge = async (payload: FormData): Promise<{ message: string, badge: Badge }> => {
    const { data } = await axiosInstance.post(endpoints.badge.create, payload, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return data;
};

/**
 * Creates a new achievement definition.
 */
export const createAchievement = async (payload: CreateAchievementPayload): Promise<{ achievement: Achievement }> => {
    const { data } = await axiosInstance.post(endpoints.achievement.create, payload);
    return data;
};

/**
 * Lists all achievement definitions (for admin panels).
 */
export const listAllAchievements = async (): Promise<{ achievements: Achievement[] }> => {
    const { data } = await axiosInstance.get(endpoints.achievement.listAll);
    return data;
};