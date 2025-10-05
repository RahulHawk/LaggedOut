import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as adminApi from '@/api/functions/admin.api';
import { BanUnbanPayload } from '@/typescript/adminTypes';
import { toast } from 'react-toastify';

export const adminKeys = {
  profile: ['admin', 'profile'] as const,
  analytics: ['admin', 'analytics'] as const,
  devRequests: ['admin', 'devRequests'] as const,
};

// --- QUERY HOOKS ---
export const useGetAdminProfile = () => {
  return useQuery({
    queryKey: adminKeys.profile,
    queryFn: adminApi.getAdminProfile,
    select: (data) => data.data,
  });
};

export const useGetDevLinkRequests = () => {
  return useQuery({
    queryKey: adminKeys.devRequests,
    queryFn: adminApi.getDevLinkRequests,
    select: (data) => data.data,
  });
};

export const useGetOverallAnalytics = () => {
  return useQuery({
    queryKey: adminKeys.analytics,
    queryFn: adminApi.getOverallAnalytics,
  });
};

// --- MUTATION HOOKS ---
export const useAdminMutations = () => {
  const queryClient = useQueryClient();

  const invalidateAdminData = () => {
    queryClient.invalidateQueries({ queryKey: adminKeys.profile });
    queryClient.invalidateQueries({ queryKey: adminKeys.devRequests });
  };

  const approveDevLinkRequestMutation = useMutation({
    mutationFn: (userId: string) => adminApi.approveDevLinkRequest(userId),
    onSuccess: (data) => {
      toast.success(data.message);
      invalidateAdminData(); // Refreshes the list of pending requests
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to approve request."),
  });

  const approveDeveloperMutation = useMutation({
    mutationFn: (developerId: string) => adminApi.approveDeveloper(developerId),
    onSuccess: (data) => {
      toast.success(data.message);
      invalidateAdminData(); // Refreshes the user list to update their status
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to approve developer."),
  });

  const banUserMutation = useMutation({
    mutationFn: (vars: { userId: string, payload: BanUnbanPayload }) => adminApi.banUser(vars),
    onSuccess: (data) => {
      toast.success(data.message);
      invalidateAdminData();
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to ban user."),
  });

  const unbanUserMutation = useMutation({
    mutationFn: (vars: { userId: string, payload: BanUnbanPayload }) => adminApi.unbanUser(vars),
    onSuccess: (data) => {
      toast.success(data.message);
      invalidateAdminData();
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to unban user."),
  });

  const promoteToDeveloperMutation = useMutation({
    mutationFn: (userId: string) => adminApi.promoteToDeveloper(userId),
    onSuccess: (data) => {
      toast.success(data.message);
      invalidateAdminData(); 
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to promote user."),
  });

  return {
    banUser: banUserMutation.mutateAsync,
    isBanningUser: banUserMutation.isPending,
    unbanUser: unbanUserMutation.mutateAsync,
    isUnbanningUser: unbanUserMutation.isPending,
    approveDevLinkRequest: approveDevLinkRequestMutation.mutateAsync,
    isApprovingDevLinkRequest: approveDevLinkRequestMutation.isPending,
    promoteToDeveloper: promoteToDeveloperMutation.mutateAsync,
    isPromotingToDeveloper: promoteToDeveloperMutation.isPending,
    approveDeveloper: approveDeveloperMutation.mutateAsync,
    isApprovingDeveloper: approveDeveloperMutation.isPending,
  };
};