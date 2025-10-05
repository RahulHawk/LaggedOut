import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import * as developerApi from "@/api/functions/developer.api";
import { Follower, FollowersApiResponse } from "@/typescript/profileTypes";

// --- MUTATION HOOKS ---

export const useFollowDeveloperMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: developerApi.followDeveloper,
        onSuccess: (data, developerId) => {
            toast.success(data.message);
            // Invalidate the developer's profile to refetch and update the follow status/count
            queryClient.invalidateQueries({ queryKey: ['developerProfile', developerId] });
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Failed to follow."),
    });
};

export const useUnfollowDeveloperMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: developerApi.unfollowDeveloper,
        onSuccess: (data, developerId) => {
            toast.info(data.message);
            queryClient.invalidateQueries({ queryKey: ['developerProfile', developerId] });
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Failed to unfollow."),
    });
};


// --- QUERY HOOK ---

export const useFollowersQuery = (developerId: string) => {
    // Pass the types to the generic useQuery hook here
    return useQuery<FollowersApiResponse, Error, Follower[]>({
        queryKey: ['followers', developerId],
        queryFn: () => developerApi.getFollowers(developerId),
        // The 'select' function now knows the input 'data' is of type FollowersApiResponse
        select: (data) => data.data,
        enabled: !!developerId,
    });
};