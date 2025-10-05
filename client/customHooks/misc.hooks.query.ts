// Import toast at the top of the file
import { toast } from 'react-toastify';

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as homeApi from "@/api/functions/misc.api";
import { Game, LibraryItem, WishlistItem } from "@/typescript/homeTypes"; // Using your corrected types

const homeKeys = {
    all: ['home'] as const,
    library: () => [...homeKeys.all, 'library'] as const,
    favorites: () => [...homeKeys.all, 'favorites'] as const,
    wishlist: () => [...homeKeys.all, 'wishlist'] as const,
};

// ===== QUERY HOOKS (Now correctly typed and generic) =====

export const useLibrary = <TData = LibraryItem[]>() => {
    return useQuery<TData, Error>({
        queryKey: ['library'],
        queryFn: async () => {
            const response = await homeApi.getLibrary();

            const libraryArray = response.library;
            return libraryArray as TData;
        },
    });
};

export const useFavorites = () => {
    return useQuery<Game[], Error>({
        queryKey: homeKeys.favorites(),
        queryFn: async () => {
            const response = await homeApi.getFavorites();
            return response.favorites || [];
        },
    });
};

export const useWishlist = <TData = WishlistItem[]>() => {
    return useQuery<TData, Error>({
        queryKey: homeKeys.wishlist(),
        queryFn: async () => {
            const data = await homeApi.getWishlist();
            return data.wishlist as TData;
        },
    });
};


// ===== MUTATION HOOKS (Updated with Toast Notifications) =====

export const useHomeMutations = (purchases?: LibraryItem[]) => {
    const queryClient = useQueryClient();

    // Add to Favorites Mutation
    const addFavoriteMutation = useMutation({
        mutationFn: (gameId: string) => homeApi.addFavorite(gameId),
        onSuccess: (data) => {
            queryClient.setQueryData(homeKeys.favorites(), data.favorites);
            toast.success(data.message || "Added to favorites!");
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Failed to add to favorites."),
    });

    const removeFavoriteMutation = useMutation({
    mutationFn: (gameId: string) => homeApi.removeFavorite(gameId),
    onMutate: async (removedGameId) => {
        await queryClient.cancelQueries({ queryKey: homeKeys.favorites() });

        const previousFavorites = queryClient.getQueryData<Game[]>(homeKeys.favorites());

        if (previousFavorites) {
            const newFavorites = previousFavorites.filter(game => game._id !== removedGameId);
            queryClient.setQueryData(homeKeys.favorites(), newFavorites);
        }

        return { previousFavorites };
    },
    onError: (err, removedGameId, context) => {
        if (context?.previousFavorites) {
            queryClient.setQueryData(homeKeys.favorites(), context.previousFavorites);
        }
        toast.error("Failed to remove from favorites.");
    },
    onSettled: () => {
        queryClient.invalidateQueries({ queryKey: homeKeys.favorites() });
    },
});



    // Add to Wishlist Mutation
    const addToWishlistMutation = useMutation({
        mutationFn: (gameId: string) => homeApi.addToWishlist(gameId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: homeKeys.wishlist() });
            // Show success message
            toast.success("Added to wishlist!");
        },
        onError: (error) => {
            console.error("Error adding to wishlist:", error);
            toast.error("Failed to add to wishlist.");
        },
    });

    const removeFromWishlistMutation = useMutation({
        mutationFn: (gameId: string) => homeApi.removeFromWishlist(gameId),
        onSuccess: () => {

            queryClient.invalidateQueries({ queryKey: homeKeys.wishlist() });

            toast.info("Removed from wishlist.");
        },
        onError: (error) => {
            console.error("Error removing from wishlist:", error);
            toast.error("Failed to remove from wishlist.");
        }
    });


    return {
        addFavorite: addFavoriteMutation.mutate,
        isAddingFavorite: addFavoriteMutation.isPending,
        removeFavorite: removeFavoriteMutation.mutate,
        isRemovingFavorite: removeFavoriteMutation.isPending,
        addToWishlist: addToWishlistMutation.mutate,
        removeFromWishlist: removeFromWishlistMutation.mutate,
    };
};