import axiosInstance from "@/api/axios/axios";
import { endpoints } from "@/api/endPoints/genre&tagEndpoints"; // IMPORT the new endpoints
import { Game, Genre, Tag } from "@/typescript/homeTypes";

export interface GenrePreview extends Genre {
    games: Game[];
}

interface GenrePreviewResponse {
    message: string;
    data: GenrePreview[];
}
interface GenresResponse {
    message: string;
    data: Genre[];
}

interface GenreResponse {
    message: string;
    genre: Genre;
}

export interface TagPreview extends Tag {
    games: Game[];
}

interface TagPreviewResponse {
    message: string;
    data: TagPreview[];
}

interface TagResponse {
    message: string;
    data: Tag[];
}

export const getAllGenres = async (): Promise<GenresResponse> => {
    const response = await axiosInstance.get<GenresResponse>(endpoints.genre.getAll); // USE the new endpoint
    return response.data;
};

export const addGenre = async (name: string): Promise<GenreResponse> => {
    const response = await axiosInstance.post<GenreResponse>(endpoints.genre.add, { name }); // USE the new endpoint
    return response.data;
};

export const updateGenre = async ({ id, name }: { id: string; name: string }): Promise<GenreResponse> => {
    const response = await axiosInstance.put<GenreResponse>(endpoints.genre.update(id), { name }); // USE the new endpoint
    return response.data;
};

export const deleteGenre = async (id: string): Promise<{ message: string }> => {
    const response = await axiosInstance.delete(endpoints.genre.delete(id)); // USE the new endpoint
    return response.data;
};

export const getGenrePreviews = async (): Promise<GenrePreviewResponse> => {
    const response = await axiosInstance.get<GenrePreviewResponse>(endpoints.genre.preview);
    return response.data;
};

export const getAllTags = async (): Promise<TagResponse> => {
    const response = await axiosInstance.get<TagResponse>(endpoints.tag.getAll); 
    return response.data;
}

export const addTag = async (name: string): Promise<TagResponse> => {
    const response = await axiosInstance.post<TagResponse>(endpoints.tag.add, { name }); 
    return response.data;
}

export const updateTag = async ({ id, name }: { id: string; name: string }): Promise<TagResponse> => {
    const response = await axiosInstance.put<TagResponse>(endpoints.tag.update(id), { name }); 
    return response.data;
}

export const deleteTag = async (id: string): Promise<{ message: string }> => {
    const response = await axiosInstance.delete(endpoints.tag.delete(id)); 
    return response.data;
};