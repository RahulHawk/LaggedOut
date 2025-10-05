import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getAllDevelopers, getAllGames, getRecommendations } from "@/api/functions/home.api";
import { GetAllGamesResponse, GetRecommendationsResponse } from "@/typescript/homeTypes";

interface UseGamesQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    genre?: string;
    tag?: string;
    developer?: string;
    sort?: string;
}

export const useGamesQuery = (
    params: UseGamesQueryParams = {},
    options: Partial<UseQueryOptions<GetAllGamesResponse>> = {}
) => {
    const {
        page = 1,
        limit = 12,
        search,
        genre,
        tag,
        developer,
        sort,
    } = params;

    return useQuery({
        queryKey: ["GAMES", page, limit, search, genre, tag, developer, sort],
        queryFn: () =>
            getAllGames({ page, limit, search, genre, tag, developer, sort }),
        staleTime: 1000 * 60,
        ...options, 
    });
};

export const useRecommendationsQuery = () => {
    return useQuery<GetRecommendationsResponse>({
        queryKey: ["RECOMMENDATIONS"],
        queryFn: getRecommendations,
        staleTime: 1000 * 60 * 5,
    });
};

export const useDevelopersQuery = () => {
    return useQuery({
        queryKey: ['developers'],
        queryFn: getAllDevelopers,
        staleTime: 1000 * 60 * 60,
    });
};
