import axiosInstance from '@/api/axios/axios'; // Your configured Axios instance
import { endpoints } from '@/api/endPoints/gameEndpoints'; // Your endpoints file
import { Game } from '@/typescript/gameTypes'; // Assuming you have this type defined

// Helper to convert an object to FormData, including files and nested objects
const createFormData = (data: Record<string, any>): FormData => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        const value = data[key];
        if (value === null || value === undefined) return;

        // Handle array of files for fields like 'screenshots'
        if (Array.isArray(value) && value.every(item => item instanceof File)) {
            value.forEach(file => formData.append(key, file));
        } 
        // Handle nested objects by JSON.stringify
        else if (typeof value === 'object' && !(value instanceof File)) {
            formData.append(key, JSON.stringify(value));
        } 
        // Handle single files and primitive values
        else {
            formData.append(key, value);
        }
    });
    return formData;
};

// --- Game CRUD ---
export const createGame = (data: Record<string, any>) => {
    const formData = createFormData(data);
    return axiosInstance.post(endpoints.game.create, formData);
};

export const updateGame = (id: string, data: Record<string, any>) => {
    const formData = createFormData(data);
    return axiosInstance.put(endpoints.game.update(id), formData);
};

export const deleteGame = (id: string) => {
    return axiosInstance.delete(endpoints.game.delete(id));
};

export const approveGame = (id: string) => {
    return axiosInstance.put(endpoints.game.approve(id));
};

// --- Edition CRUD ---
export const addEdition = (gameId: string, data: Record<string, any>) => {
    const formData = createFormData(data);
    return axiosInstance.post(endpoints.game.addEdition(gameId), formData);
};

export const updateEdition = (gameId: string, editionId: string, data: Record<string, any>) => {
    const formData = createFormData(data);
    return axiosInstance.put(endpoints.game.updateEdition(gameId, editionId), formData);
};

export const deleteEdition = (gameId: string, editionId: string) => {
    return axiosInstance.delete(endpoints.game.deleteEdition(gameId, editionId));
};

// --- DLC CRUD ---
export const addDLC = (gameId: string, data: Record<string, any>) => {
    const formData = createFormData(data);
    return axiosInstance.post(endpoints.game.addDLC(gameId), formData);
};

export const updateDLC = (gameId: string, dlcId: string, data: Record<string, any>) => {
    const formData = createFormData(data);
    return axiosInstance.put(endpoints.game.updateDLC(gameId, dlcId), formData);
};

export const deleteDLC = (gameId: string, dlcId: string) => {
    return axiosInstance.delete(endpoints.game.deleteDLC(gameId, dlcId));
};

// --- Game Data Fetching ---
// Note: 'params' can be an object for URL query params, e.g., { page: 1, limit: 10 }
export const getAllGames = (params?: Record<string, any>) => {
    return axiosInstance.get<{ data: Game[] }>(endpoints.game.getAll, { params });
};

export const getSingleGame = (id: string) => {
    return axiosInstance.get<{ data: Game }>(endpoints.game.getSingle(id));
};

export const getMyGames = () => {
  return axiosInstance.get<{ data: Game[] }>('/game/my-games');
};

export const getRecommendations = () => {
    return axiosInstance.get(endpoints.game.getRecommendations);
};