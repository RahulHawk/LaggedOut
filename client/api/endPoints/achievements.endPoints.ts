
export const endpoints = {
  inventory: {
    get: "/inventory",
  },
  
  badge: {
    create: "/badges",
  },

  achievement: {
    listUserStatus: "/all&my-achievements",
    create: "/achievements",
    listAll: "/achievements",
  },
};

export const successNotificationEndpoints: string[] = [
    endpoints.inventory.get,
    endpoints.badge.create,
    endpoints.achievement.listUserStatus,
    endpoints.achievement.create,
    endpoints.achievement.listAll
];