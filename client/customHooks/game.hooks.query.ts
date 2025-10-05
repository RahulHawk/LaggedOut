import { useQuery } from '@tanstack/react-query';
import { getGameById } from '../api/functions/game.api';
import { Game } from '../typescript/homeTypes';

/**
 * Custom hook to get a single game's data using TanStack Query.
 * @param gameId The ID of the game.
 */
export const useGame = (gameId: string | undefined) => {
  return useQuery<Game, Error>({
    queryKey: ['game', gameId],
    queryFn: () => getGameById(gameId!),

    enabled: !!gameId,

    staleTime: 1000 * 60 * 5, 
    retry: 1, 
  });
};