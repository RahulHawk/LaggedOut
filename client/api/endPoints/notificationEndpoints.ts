export const endpoints = {
  notification: {
    getAll: "/notification",
    markAsRead: (notificationId: string) => `/notification/${notificationId}/read`,
    markAllAsRead: "/notification/read-all",
    delete: (notificationId: string) => `/notification/${notificationId}`,
    deleteAll: "/notification/delete-all",
    // Admin Only
    create: "/notification",
  },
};