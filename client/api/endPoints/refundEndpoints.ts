export const endpoints = {
    refund: {
        request: "/refund/request-refund",
        listMy: "/refund/my-refunds",
        // Admin Only
        review: (refundId: string) => `/refund/review/${refundId}`,
        listAll: "/refund/all-refunds",
    },
};