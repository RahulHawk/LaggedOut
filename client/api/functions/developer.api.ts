import axiosInstance from '@/api/axios/axios';

export const followDeveloper = async (developerId: string): Promise<{ message: string }> => {
    const { data } = await axiosInstance.post(`/profile/follow/${developerId}`);
    return data;
};

export const unfollowDeveloper = async (developerId: string): Promise<{ message: string }> => {
    const { data } = await axiosInstance.post(`/profile/unfollow/${developerId}`);
    return data;
};

export const getFollowers = async (developerId: string): Promise<any> => { // Replace 'any' with a proper Follower type
    const { data } = await axiosInstance.get(`/profile/followers/${developerId}`);
    return data;
};