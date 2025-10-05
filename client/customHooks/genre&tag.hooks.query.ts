import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllGenres, addGenre, updateGenre, deleteGenre, getGenrePreviews, getAllTags, addTag, updateTag, deleteTag } from '@/api/functions/genre&tag.api';
import { toast } from 'react-toastify';
import { Tag } from '@/typescript/homeTypes';

// Query to get all genres
export const useGenresQuery = () => {
    return useQuery({
        queryKey: ['genres'],
        queryFn: getAllGenres,
        staleTime: 1000 * 60 * 60,
        select: (response) => response.data || [],
    });
};

// Mutation to add a genre
export const useAddGenreMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: addGenre,
        onSuccess: () => {
            toast.success("Genre added successfully!");
            // Automatically refetch the genres list after a new one is added
            queryClient.invalidateQueries({ queryKey: ['genres'] });
        },
        onError: (error) => {
            toast.error(error.message || "Failed to add genre.");
        },
    });
};

// Mutation to update a genre
export const useUpdateGenreMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateGenre,
        onSuccess: () => {
            toast.success("Genre updated successfully!");
            queryClient.invalidateQueries({ queryKey: ['genres'] });
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update genre.");
        },
    });
};

// Mutation to delete a genre
export const useDeleteGenreMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteGenre,
        onSuccess: () => {
            toast.success("Genre deleted successfully!");
            queryClient.invalidateQueries({ queryKey: ['genres'] });
        },
        onError: (error) => {
            toast.error(error.message || "Failed to delete genre.");
        },
    });
};

export const useGenrePreviewsQuery = () => {
    return useQuery({
        queryKey: ['genrePreviews'],
        queryFn: getGenrePreviews,
        staleTime: 1000 * 60 * 5, 
    });
};

export const useTagsQuery = () => {
    return useQuery({
        queryKey: ['tags'],
        queryFn: getAllTags,
        staleTime: 1000 * 60 * 60,
        select: (response: any) => response.data || [],
    });
};

// FIX: Added missing mutation hooks for Tags
export const useAddTagMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: addTag,
        onSuccess: () => {
            toast.success("Tag added successfully!");
            queryClient.invalidateQueries({ queryKey: ['tags'] });
        },
        onError: (error) => toast.error(error.message || "Failed to add tag."),
    });
};

export const useUpdateTagMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateTag,
        onSuccess: () => {
            toast.success("Tag updated successfully!");
            queryClient.invalidateQueries({ queryKey: ['tags'] });
        },
        onError: (error) => toast.error(error.message || "Failed to update tag."),
    });
};

export const useDeleteTagMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteTag,
        onSuccess: () => {
            toast.success("Tag deleted successfully!");
            queryClient.invalidateQueries({ queryKey: ['tags'] });
        },
        onError: (error) => toast.error(error.message || "Failed to delete tag."),
    });
};