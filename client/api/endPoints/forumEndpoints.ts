export const endpoints = {  
  forum: {
    createPost: "/forum",
    getPostsByGame: (gameId: string) => `/forum/game/${gameId}`,
    getPostsPaginated: (gameId: string) => `/forum/game/${gameId}/paginated`,
    getPostById: (postId: string) => `/forum/${postId}`,
    updatePost: (postId: string) => `/forum/${postId}`,
    deletePost: (postId: string) => `/forum/${postId}`,
    likePost: (postId: string) => `/forum/${postId}/like`,
    dislikePost: (postId: string) => `/forum/${postId}/dislike`,

    // Comments
    addComment: (postId: string) => `/forum/${postId}/comment`,
    deleteComment: (postId: string, commentId: string) => `/forum/${postId}/comment/${commentId}`,
    likeComment: (postId: string, commentId: string) => `/forum/${postId}/comment/${commentId}/like`,
    dislikeComment: (postId: string, commentId: string) => `/forum/${postId}/comment/${commentId}/dislike`,
  },
};