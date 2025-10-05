export const endpoints = {
    review: {
        add: "/review",
        update: (reviewId: string) => `/review/${reviewId}`,
        delete: (reviewId: string) => `/review/${reviewId}`,
        getByGame: (gameId: string) => `/review/game/${gameId}`,
        getUserReviewForGame: (gameId: string) => `/review/game/${gameId}/user`,
    },
};