// src/types/review.ts

// A reusable type for the populated user object in a review
export interface ReviewUser {
    _id: string;
    name: string; // Assuming 'name' is a virtual on your User model
    profile: {
        profilePic?: string;
    };
}

export interface Review {
    _id: string;
    game: string;
    user: ReviewUser;
    rating: number;
    comment?: string;
    createdAt: string;
    updatedAt: string;
}

export interface StarBreakdown {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
}

// The response from the GET /review/game/:gameId endpoint
export interface PaginatedReviewsResponse {
    averageRating: number;
    totalReviews: number;
    starBreakdown: StarBreakdown;
    currentPage: number;
    totalPages: number;
    reviews: Review[];
}

// Payloads for creating and updating reviews
export interface AddReviewPayload {
    game: string; // gameId
    rating: number;
    comment?: string;
}

export interface UpdateReviewPayload {
    rating?: number;
    comment?: string;
}