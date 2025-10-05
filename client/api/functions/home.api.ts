import axiosInstance from "@/api/axios/axios";
import { endpoints } from "@/api/endPoints/gameEndpoints";
import { DevelopersResponse, GetAllGamesResponse, GetRecommendationsResponse } from "@/typescript/homeTypes";

// This interface is no longer needed for the return types of these functions
interface GetAllGamesParams {
  page?: number;
  limit?: number;
  search?: string;
  genre?: string;
  tag?: string;
  developer?: string;
  sort?: string;
}

export const getAllGames = async (
  params: GetAllGamesParams
): Promise<GetAllGamesResponse> => {
  const response = await axiosInstance.get<GetAllGamesResponse>(endpoints.game.getAll, {
    params,
  });
  return response.data;
};

export const getRecommendations = async (): Promise<GetRecommendationsResponse> => {

  const response = await axiosInstance.get<GetRecommendationsResponse>(
    endpoints.game.getRecommendations
  );
  return response.data;
};

export const getAllDevelopers = async (): Promise<DevelopersResponse> => {
    const response = await axiosInstance.get<DevelopersResponse>(`${endpoints.game.getAll}?groupBy=developer`);
    return response.data;
};