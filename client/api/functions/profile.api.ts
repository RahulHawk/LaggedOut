import axiosInstance from "@/api/axios/axios";
import { endpoints } from "@/api/endPoints/profileEndpoints";
import { DeveloperAnalyticsResponse, DeveloperProfileResponse, MyDeveloperProfileResponse, MyProfileData, MyProfileResponse, PlayerProfileResponse, UpdatePasswordPayload, UpdateProfilePayload, UserRoleResponse } from "@/typescript/profileTypes";

export const fetchMyProfile = async () => {
  const response = await axiosInstance.get<MyProfileResponse>(endpoints.profile.me);
  return response.data.data;
};

export const updateProfile = async (
  payload: UpdateProfilePayload | FormData
): Promise<{ message: string; data: MyProfileData }> => {
  let dataToSend: FormData;

  if (!(payload instanceof FormData)) {
    dataToSend = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          // 🔹 Always stringify arrays so even empty arrays are sent
          dataToSend.append(key, JSON.stringify(value));
        } else {
          dataToSend.append(key, value as string);
        }
      }
    });
  } else {
    dataToSend = payload;
  }

  const { data } = await axiosInstance.patch(endpoints.profile.update, dataToSend, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};


export const updateEmail = async ({ newEmail }: { newEmail: string }) => {
  const { data } = await axiosInstance.post(endpoints.profile.updateEmail, { newEmail });
  return data;
};

export const updatePassword = async (payload: UpdatePasswordPayload) => {
    const { data } = await axiosInstance.post(endpoints.profile.updatePassword, payload);
    return data;
}

export const getPlayerProfile = async (id: string): Promise<PlayerProfileResponse> => {
    const { data } = await axiosInstance.get(endpoints.profile.player(id));
    return data;
};

export const getDeveloperProfile = async (id: string): Promise<DeveloperProfileResponse> => {
    const { data } = await axiosInstance.get(`/profile/developer/${id}`);
    return data;
};

export const getUserRole = async (id: string): Promise<UserRoleResponse> => {
    const { data } = await axiosInstance.get(`/profile/role/${id}`);
    return data;
};

export const getMyDeveloperProfile = async (): Promise<MyDeveloperProfileResponse> => {
    const { data } = await axiosInstance.get("profile/developer/me");
    return data;
};

export const getDeveloperAnalytics = async (): Promise<DeveloperAnalyticsResponse> => {
    const { data } = await axiosInstance.get("profile/developer/analytics");
    return data;
};