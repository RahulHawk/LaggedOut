// src/types/forum.ts

// A reusable type for populated user fields in the forum
export interface ForumUser {
    _id: string;
    firstName: string;
    profile?: {
        profilePic?: string;
    };
}

export interface Comment {
    _id: string;
    user: ForumUser;
    text: string;
    likes: string[]; // Array of user IDs
    dislikes: string[]; // Array of user IDs
    createdAt: string;
}

export interface Post {
    _id: string;
    game: string; // Game ID
    type: "discussion" | "announcement";
    title: string;
    content: string;
    author: ForumUser;
    likes: string[];
    dislikes: string[];
    comments: Comment[];
    createdAt: string;
    updatedAt: string;
}

export interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface PaginatedPostsResponse {
    posts: Post[];
    pagination: Pagination;
}

// Payloads for mutations
export interface CreatePostPayload {
    game: string;
    type: "discussion" | "announcement";
    title: string;
    content: string;
}

export interface UpdatePostPayload {
    title?: string;
    content?: string;
    type?: "discussion" | "announcement";
}

export interface AddCommentPayload {
    text: string;
}

// For like/dislike responses
export interface LikeDislikeResponse {
    message: string;
    likes: number;
    dislikes: number;
}