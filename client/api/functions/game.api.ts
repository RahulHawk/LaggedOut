import axiosInstance from '@/api/axios/axios';
import { endpoints } from '@/api/endPoints/gameEndpoints';
import { Game, ApiResponse } from '@/typescript/homeTypes'; 
import axios from 'axios';

/**
 * Fetches a single game by its ID from the API.
 * @param gameId The ID of the game to fetch.
 * @returns A promise that resolves to the game data.
 */
export const getGameById = async (gameId: string): Promise<Game> => {
  try {
    const response = await axiosInstance.get<ApiResponse<Game>>(
      endpoints.game.getSingle(gameId)
    );
    

    if (response.data && response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to get game data.');
    }
  } catch (error) {

    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'An API error occurred.');
    }
    throw error; 
  }
};