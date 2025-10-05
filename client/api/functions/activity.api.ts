import axiosInstance from '@/api/axios/axios';
import { endpoints } from '@/api/endPoints/activityEndpoints';
import { PaginatedActivityResponse } from '@/typescript/activityTypes';

/**
 * Fetches a paginated list of the current user's activities.
 */
export const getActivity = async ({ pageParam = 1, limit = 15 }): Promise<PaginatedActivityResponse> => {
    const { data } = await axiosInstance.get(endpoints.activity.get, {
        params: { page: pageParam, limit }
    });
    return data;
};