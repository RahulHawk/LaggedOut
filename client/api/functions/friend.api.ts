// src/api/functions/friend.api.ts

import axiosInstance from '@/api/axios/axios';
import { endpoints } from '@/api/endPoints/friendEndpoints';
import { AllFriendDataResponse, FriendActionPayload, FriendUser } from '@/typescript/friendTypes';

export const getAllFriendData = async (): Promise<AllFriendDataResponse> => {
    const { data } = await axiosInstance.get(endpoints.friend.getAllData);
    return data;
};

export const searchUsers = async (query: string): Promise<FriendUser[]> => {
    const { data } = await axiosInstance.get(endpoints.friend.search, { params: { query } });
    return data;
};

export const sendFriendRequest = async (payload: FriendActionPayload): Promise<{ message: string }> => {
    const { data } = await axiosInstance.post(endpoints.friend.sendRequest, payload);
    return data;
};

export const cancelFriendRequest = async (payload: FriendActionPayload): Promise<{ message: string }> => {
    const { data } = await axiosInstance.post(endpoints.friend.cancelRequest, payload);
    return data;
};

export const acceptFriendRequest = async (payload: FriendActionPayload): Promise<{ message: string }> => {
    const { data } = await axiosInstance.post(endpoints.friend.acceptRequest, payload);
    return data;
};

export const rejectFriendRequest = async (payload: FriendActionPayload): Promise<{ message:string }> => {
    const { data } = await axiosInstance.post(endpoints.friend.rejectRequest, payload);
    return data;
};

export const unfriendUser = async (payload: FriendActionPayload): Promise<{ message:string }> => {
    const { data } = await axiosInstance.post(endpoints.friend.unfriend, payload);
    return data;
};

export const blockUser = async (payload: FriendActionPayload): Promise<{ message:string }> => {
    const { data } = await axiosInstance.post(endpoints.friend.block, payload);
    return data;
};

export const unblockUser = async (payload: FriendActionPayload): Promise<{ message:string }> => {
    const { data } = await axiosInstance.post(endpoints.friend.unblock, payload);
    return data;
};