import { useInfiniteQuery } from '@tanstack/react-query';
import * as activityApi from '@/api/functions/activity.api';

const activityKeys = {
    all: ['activity'] as const,
};

/**
 * Hook to fetch paginated user activity, designed for infinite scrolling.
 */
export const useActivityQuery = () => {
    return useInfiniteQuery({
        queryKey: activityKeys.all,
        
        // Tells React Query how to fetch a page
        queryFn: ({ pageParam }) => activityApi.getActivity({ pageParam }),

        // Tells React Query how to get the next page number
        getNextPageParam: (lastPage) => {
            const currentPage = lastPage.pagination.page;
            const totalPages = lastPage.pagination.totalPages;
            return currentPage < totalPages ? currentPage + 1 : undefined;
        },
        
        // The initial page to fetch
        initialPageParam: 1,
    });
};