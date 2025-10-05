// src/services/api/homeApi.ts

import axiosInstance from "@/api/axios/axios";
import { endpoints } from "@/api/endPoints/miscEndpoints";
import {
    LibraryResponse,
    FavoritesResponse,
    WishlistResponse,
    UpdateFavoritesResponse,
    UpdateWishlistResponse
} from "@/typescript/miscTypes";

/**
 * Fetches the user's game library.
 */
export const getLibrary = async (): Promise<LibraryResponse> => {
    const { data } = await axiosInstance.get<LibraryResponse>(endpoints.library.get);
    return data;
};

/**
 * Fetches the user's favorite games.
 */
export const getFavorites = async (): Promise<FavoritesResponse> => {
    const { data } = await axiosInstance.get<FavoritesResponse>(endpoints.favorites.getAll);
    return data;
};

/**
 * Fetches the user's wishlist.
 */
export const getWishlist = async (): Promise<WishlistResponse> => {
    const { data } = await axiosInstance.get<WishlistResponse>(endpoints.wishlist.getAll);
    return data;
};

/**
 * Adds a game to the user's favorites.
 * @param gameId The ID of the game to add.
 */
export const addFavorite = async (gameId: string): Promise<UpdateFavoritesResponse> => {
    const { data } = await axiosInstance.post<UpdateFavoritesResponse>(endpoints.favorites.add, { gameId });
    return data;
};

/**
 * Removes a game from the user's favorites.
 * @param gameId The ID of the game to remove.
 */
export const removeFavorite = async (gameId: string): Promise<UpdateFavoritesResponse> => {
    const { data } = await axiosInstance.delete<UpdateFavoritesResponse>(endpoints.favorites.remove(gameId));
    return data;
};

/**
 * Adds a game to the user's wishlist.
 * @param gameId The ID of the game to add.
 */
export const addToWishlist = async (gameId: string): Promise<UpdateWishlistResponse> => {
    const { data } = await axiosInstance.post<UpdateWishlistResponse>(endpoints.wishlist.add, { gameId });
    return data;
};

/**
 * Removes a game from the user's wishlist.
 * @param gameId The ID of the game to remove.
 */
export const removeFromWishlist = async (gameId: string): Promise<UpdateWishlistResponse> => {
    const { data } = await axiosInstance.delete<UpdateWishlistResponse>(endpoints.wishlist.remove(gameId));
    return data;
};