export const adminEndpoints = {
  getProfile: "/admin/profile",
  approveDeveloper: (developerId: string) => `/admin/approve-developer/${developerId}`,
  banUser: (userId: string) => `/admin/ban-user/${userId}`,
  unbanUser: (userId: string) => `/admin/unban-user/${userId}`,
  promoteToDeveloper: (userId: string) => `/admin/promote-to-developer/${userId}`,
  getDevLinkRequests: '/admin/dev-link-requests',
  approveDevLinkRequest: (userId: string) => `/admin/dev-link-requests/${userId}/approve`,
};

export const analyticsEndpoints = {
  getOverall: "/analytics/overall",
};
