export const endpoints = {
    game: {
        create: "/game/create",
        addEdition: (gameId: string) => `/game/add-edition/${gameId}`,
        addDLC: (gameId: string) => `/game/add-dlc/${gameId}`,
        update: (id: string) => `/game/update/${id}`,
        delete: (id: string) => `/game/delete/${id}`,
        updateEdition: (gameId: string, editionId: string) => `/game/${gameId}/update-edition/${editionId}`,
        deleteEdition: (gameId: string, editionId: string) => `/game/${gameId}/delete-edition/${editionId}`,
        updateDLC: (gameId: string, dlcId: string) => `/game/${gameId}/update-dlc/${dlcId}`,
        deleteDLC: (gameId: string, dlcId: string) => `/game/${gameId}/delete-dlc/${dlcId}`,
        approve: (id: string) => `/game/approve/${id}`,
        getAll: "/game/all",
        getSingle: (id: string) => `/game/single/${id}`,
        getRecommendations: "/game/recommendations",
    },
};

export const successNotificationEndpoints: string[] = [
    endpoints.game.create,
    endpoints.game.getAll,
    endpoints.game.getRecommendations,
];
