// src/types/achievement.ts

// --- Core Data Structures ---

export interface Badge {
    _id: string;
    name: string;
    image: string;
    description?: string;
}

export interface Achievement {
    _id: string;
    name: string;
    description?: string;
    condition: string;
    badge: Badge | null;
}

// A simple placeholder type for Avatars
export interface Avatar {
    _id: string;
    name: string;
    imageUrl: string;
}

export interface Inventory {
    user: string;
    avatars: Avatar[];
    badges: Badge[];
}

// --- API Response & Payload Types ---

// Type for the response of the main user-facing achievement list
export interface UserAchievementStatus extends Achievement {
    earned: boolean;
    id: string;
}

export interface AllAndMyAchievementsResponse {
    allAchievements: UserAchievementStatus[];
    myAchievements: UserAchievementStatus[];
}

// Payload for creating a new achievement (Admin)
export interface CreateAchievementPayload {
    name: string;
    description?: string;
    condition: string;
    badgeId?: string;
}

// Note: The payload for creating a badge is FormData, which doesn't need a specific interface.