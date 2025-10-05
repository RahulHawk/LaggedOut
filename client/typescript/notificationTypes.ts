// src/types/notification.ts

// The possible types of notifications from your schema's enum
export type NotificationType = 
    | "friend_request" | "friend_accept" | "follow" | "comment" 
    | "like" | "dislike" | "sale" | "announcement" 
    | "new_game" | "game_update";

// A type for the populated relatedUser field
export interface RelatedUser {
    _id: string;
    firstName: string;
    profile: {
        profilePic?: string;
    };
}

// The main Notification interface, matching your API response
export interface Notification {
    _id: string;
    user: string;
    type: NotificationType;
    content: string;
    link?: string;
    relatedUser?: RelatedUser;
    read: boolean;
    meta?: any; // Mongoose 'Mixed' can be 'any' or a more specific object
    createdAt: string;
}

// Payload for creating a new notification (Admin Only)
export interface CreateNotificationPayload {
    user: string; // The ID of the user to receive the notification
    type: NotificationType;
    content: string;
    link?: string;
    relatedUser?: string;
    meta?: object;
}