import { Game } from '@/typescript/homeTypes'; 
export type ActivityType = "purchase" | "review" | "achievement";

export interface Activity {
    _id: string;
    user: string;
    game: Pick<Game, '_id' | 'title' | 'coverImage'> | null; 
    type: ActivityType;
    details: any; 
    createdAt: string;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface PaginatedActivityResponse {
    status: boolean;
    activities: Activity[];
    pagination: Pagination;
}