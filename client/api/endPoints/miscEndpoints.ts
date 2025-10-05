export const endpoints = {
    library: {
      get: "/library",
    },
    favorites: {
      getAll: "/favorites",
      add: "/add-favorite",
      remove: (gameId: string) => `/remove-favorite/${gameId}`,
    },
    wishlist: {
      getAll: "/wishlist",
      add: "/add-to-wishlist",
      remove: (gameId: string) => `/remove-from-wishlist/${gameId}`,
    },
};

export const successNotificationEndpoints: string[] = [
    endpoints.library.get,
    endpoints.favorites.getAll,
    endpoints.favorites.add,
    endpoints.favorites.remove("dummyId"),
    endpoints.wishlist.getAll,
    endpoints.wishlist.add,
    endpoints.wishlist.remove("dummyId"),
];

