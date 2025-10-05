export const endpoints = {
  profile: {
    me: "/profile/me",
    player: (id: string) => `/profile/player/${id}`,
    developer: (developerId: string) => `/profile/developer/${developerId}`,
    update: "/profile/update",
    updateEmail: "/profile/update-email",
    updatePassword: "/profile/update-password",
    linkGoogle: "/profile/link/google",
    linkGoogleCallback: "/profile/link/google/callback",
    followDeveloper: (developerId: string) => `/profile/follow/${developerId}`,
    unfollowDeveloper: (developerId: string) => `/profile/unfollow/${developerId}`,
    getAllDevelopers: "/profile/developers",
    getFollowers: (developerId: string) => `/profile/followers/${developerId}`,
  },
};

export const successNotificationEndpoints: string[] = [
  endpoints.profile.me,
  endpoints.profile.update,
  endpoints.profile.updateEmail,
  endpoints.profile.updatePassword,
  endpoints.profile.linkGoogle,
  endpoints.profile.linkGoogleCallback,
  endpoints.profile.getAllDevelopers,
];
