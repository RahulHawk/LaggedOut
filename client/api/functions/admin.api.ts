import axiosInstance from "@/api/axios/axios";
import { adminEndpoints, analyticsEndpoints } from "@/api/endPoints/adminEndpoints";
import { AdminProfileData, BanUnbanPayload, DevLinkRequest, OverallAnalyticsData } from "@/typescript/adminTypes";

// --- Admin Profile & User Management ---
export const getAdminProfile = async (): Promise<{ data: AdminProfileData }> => {
  const response = await axiosInstance.get(adminEndpoints.getProfile);
  return response.data;
};

export const approveDeveloper = async (developerId: string) => {
  const response = await axiosInstance.put(adminEndpoints.approveDeveloper(developerId));
  return response.data;
};

export const banUser = async ({ userId, payload }: { userId: string, payload: BanUnbanPayload }) => {
  const response = await axiosInstance.put(adminEndpoints.banUser(userId), payload);
  return response.data;
};

export const unbanUser = async ({ userId, payload }: { userId: string, payload: BanUnbanPayload }) => {
  const response = await axiosInstance.put(adminEndpoints.unbanUser(userId), payload);
  return response.data;
};

export const promoteToDeveloper = async (userId: string) => {
  const response = await axiosInstance.put(adminEndpoints.promoteToDeveloper(userId));
  return response.data;
};

// --- Developer Link Requests ---
export const getDevLinkRequests = async (): Promise<{ data: DevLinkRequest[] }> => {
  const response = await axiosInstance.get(adminEndpoints.getDevLinkRequests);
  return response.data;
};

export const approveDevLinkRequest = async (userId: string) => {
  const response = await axiosInstance.post(adminEndpoints.approveDevLinkRequest(userId));
  return response.data;
};

// --- Analytics ---
export const getOverallAnalytics = async (): Promise<OverallAnalyticsData> => {
  const response = await axiosInstance.get(analyticsEndpoints.getOverall);
  return response.data;
};