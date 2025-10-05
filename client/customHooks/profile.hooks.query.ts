import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchMyProfile, updateProfile, updateEmail, updatePassword, getPlayerProfile, getDeveloperProfile, getUserRole, getMyDeveloperProfile, getDeveloperAnalytics } from "@/api/functions/profile.api";
import { MyProfileData, UpdatePasswordPayload, UpdateProfilePayload } from "@/typescript/profileTypes";
import { toast } from "react-toastify";

export const useMyProfileQuery = (options?: object) => {
  return useQuery<MyProfileData, Error>({
    queryKey: ['MY_PROFILE'],
    queryFn: fetchMyProfile,
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload | FormData) => updateProfile(payload),
    onSuccess: (response,variables) => {
      const updatedUser = response.data;

      queryClient.setQueryData(['MY_PROFILE'], updatedUser);

      toast.success(response.message || 'Profile updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile.');
    },
  });
};

export const useUpdateEmailMutation = () => {
  return useMutation({
    mutationFn: updateEmail,
    onSuccess: () => {
      toast.success('Verification email sent to new address!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update email.');
    },
  });
}

export const useUpdatePasswordMutation = () => {
  return useMutation<any, Error, UpdatePasswordPayload>({
    mutationFn: updatePassword,
    onSuccess: () => {
      toast.success('Password updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update password.');
    },
  });
}

export const usePlayerProfileQuery = (id: string) => {
    return useQuery({
        // The query key includes the id to cache each profile separately
        queryKey: ['playerProfile', id],
        queryFn: () => getPlayerProfile(id),
        // This ensures the query only runs when an 'id' is available
        enabled: !!id,
    });
};

export const useDeveloperProfileQuery = (id: string) => {
    return useQuery({
        queryKey: ['developerProfile', id],
        queryFn: () => getDeveloperProfile(id),
        enabled: !!id,
    });
};

export const useUserRoleQuery = (id: string) => {
    return useQuery({
        queryKey: ['userRole', id],
        queryFn: () => getUserRole(id),
        enabled: !!id,
        staleTime: 1000 * 60 * 5, // Cache the role for 5 minutes
    });
};

export const useMyDeveloperProfileQuery = (options?: object) => {
  return useQuery({
    queryKey: ['MY_DEVELOPER_PROFILE'],
    queryFn: getMyDeveloperProfile,
    select: (data) => data.data,
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};

export const useDeveloperAnalyticsQuery = () => {
  return useQuery({
    queryKey: ['DEVELOPER_ANALYTICS'],
    queryFn: getDeveloperAnalytics,
    select: (data) => data.data,
  });
};