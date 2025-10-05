import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as gameService from '@/api/functions/gameDev.api';
import { toast } from 'react-toastify'; // Updated import
import { Game } from '@/typescript/gameTypes';

// A key factory for consistent and predictable query keys
export const gameKeys = {
    all: ['games'] as const,
    lists: () => [...gameKeys.all, 'list'] as const,
    list: (filters: string) => [...gameKeys.lists(), { filters }] as const,
    details: () => [...gameKeys.all, 'detail'] as const,
    detail: (id: string) => [...gameKeys.details(), id] as const,
    recommendations: () => [...gameKeys.all, 'recommendations'] as const,
};

// == QUERY HOOKS (for fetching data) ==

export const useGetAllGames = (
    params?: Record<string, any>,
    enabled: boolean = true
) => {
    const filters = JSON.stringify(params ?? {});
    return useQuery<Game[]>({
        queryKey: gameKeys.list(filters),
        queryFn: async () => {
            const response = await gameService.getAllGames(params);
            return response.data.data;
        },
        enabled,
    });
};

export const useGetMyGames = () => {
  return useQuery<Game[]>({
    queryKey: ['my-games'],
    queryFn: async () => {
      const res = await gameService.getMyGames();
      return res.data.data;
    },
  });
};

export const useGetSingleGame = (id: string) => {
    return useQuery({
        queryKey: gameKeys.detail(id),
        queryFn: () => gameService.getSingleGame(id),
        enabled: !!id,
        select: (data) => data.data,
    });
};

export const useGetRecommendations = () => {
    return useQuery({
        queryKey: gameKeys.recommendations(),
        queryFn: gameService.getRecommendations,
    });
};

// == MUTATION HOOKS (for creating, updating, deleting data) ==

export const useGameMutations = () => {
    const queryClient = useQueryClient();

    // Generic error handler to display API errors
    const onMutationError = (error: any) => {
        const message = error?.response?.data?.message || "An unexpected error occurred.";
        toast.error(message);
    };

    // Generic success handler to invalidate queries and show a success message
    const onMutationSuccess = (successMessage: string) => {
        toast.success(successMessage);
        queryClient.invalidateQueries({ queryKey: gameKeys.lists() });
        queryClient.invalidateQueries({ queryKey: gameKeys.details() }); // Also invalidate single game details
    };

    const createGameMutation = useMutation({
        mutationFn: gameService.createGame,
        onSuccess: () => onMutationSuccess("Game created successfully!"),
        onError: onMutationError,
    });

    const updateGameMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) =>
            gameService.updateGame(id, data),
        onSuccess: () => onMutationSuccess("Game updated successfully."),
        onError: onMutationError,
    });

    const deleteGameMutation = useMutation({
        mutationFn: gameService.deleteGame,
        onSuccess: () => onMutationSuccess("Game deleted."),
        onError: onMutationError,
    });

    const addEditionMutation = useMutation({
        mutationFn: ({ gameId, data }: { gameId: string; data: Record<string, any> }) =>
            gameService.addEdition(gameId, data),
        onSuccess: () => onMutationSuccess("Edition added successfully."),
        onError: onMutationError,
    });

    const updateEditionMutation = useMutation({
        mutationFn: ({ gameId, editionId, data }: { gameId: string; editionId: string; data: Record<string, any> }) =>
            gameService.updateEdition(gameId, editionId, data),
        onSuccess: () => onMutationSuccess("Edition updated successfully."),
        onError: onMutationError,
    });

    const deleteEditionMutation = useMutation({
        mutationFn: ({ gameId, editionId }: { gameId: string; editionId: string }) =>
            gameService.deleteEdition(gameId, editionId),
        onSuccess: () => onMutationSuccess("Edition deleted."),
        onError: onMutationError,
    });

    const addDlcMutation = useMutation({
        mutationFn: ({ gameId, data }: { gameId: string; data: Record<string, any> }) =>
            gameService.addDLC(gameId, data),
        onSuccess: () => onMutationSuccess("DLC added successfully."),
        onError: onMutationError,
    })

    const updateDlcMutation = useMutation({
        mutationFn: ({ gameId, dlcId, data }: { gameId: string; dlcId: string; data: Record<string, any> }) =>
            gameService.updateDLC(gameId, dlcId, data),
        onSuccess: () => onMutationSuccess("DLC updated successfully."),
        onError: onMutationError,
    })

    const deleteDlcMutation = useMutation({
        mutationFn: ({ gameId, dlcId }: { gameId: string; dlcId: string }) =>
            gameService.deleteDLC(gameId, dlcId),
        onSuccess: () => onMutationSuccess("DLC deleted."),
        onError: onMutationError,
    });

    const approveGameMutation = useMutation({
        mutationFn: gameService.approveGame,
        onSuccess: () => {
            toast.success("Game approved successfully!");
            // Refetch all lists of games to update the UI
            queryClient.invalidateQueries({ queryKey: gameKeys.lists() });
        },
        onError: onMutationError,
    });

    return {
        createGame: createGameMutation.mutateAsync,
        isCreatingGame: createGameMutation.isPending,
        updateGame: updateGameMutation.mutateAsync,
        isUpdatingGame: updateGameMutation.isPending,
        deleteGame: deleteGameMutation.mutateAsync,
        isDeletingGame: deleteGameMutation.isPending,
        addEdition: addEditionMutation.mutateAsync,
        isAddingEdition: addEditionMutation.isPending,
        updateEdition: updateEditionMutation.mutateAsync,
        isUpdatingEdition: updateEditionMutation.isPending,
        deleteEdition: deleteEditionMutation.mutateAsync,
        isDeletingEdition: deleteEditionMutation.isPending,
        addDLC: addDlcMutation.mutateAsync,
        isAddingDLC: addDlcMutation.isPending,
        updateDLC: updateDlcMutation.mutateAsync,
        isUpdatingDLC: updateDlcMutation.isPending,
        deleteDLC: deleteDlcMutation.mutateAsync,
        isDeletingDLC: deleteDlcMutation.isPending,
        approveGame: approveGameMutation.mutateAsync,
        isApprovingGame: approveGameMutation.isPending,
    };
};