import axiosInstance from '@/api/axios/axios';
import { endpoints } from '@/api/endPoints/notificationEndpoints';
import { Notification, CreateNotificationPayload } from '@/typescript/notificationTypes';

// --- User-Facing API Calls ---

export const getUserNotifications = async (): Promise<{ notifications: Notification[] }> => {
    const { data } = await axiosInstance.get(endpoints.notification.getAll);
    return data;
};

export const markAsRead = async (notificationId: string): Promise<{ message: string, notification: Notification }> => {
    const { data } = await axiosInstance.put(endpoints.notification.markAsRead(notificationId));
    return data;
};

export const markAllAsRead = async (): Promise<{ message: string }> => {
    const { data } = await axiosInstance.put(endpoints.notification.markAllAsRead);
    return data;
};

export const deleteNotification = async (notificationId: string): Promise<{ message: string }> => {
    const { data } = await axiosInstance.delete(endpoints.notification.delete(notificationId));
    return data;
};

export const deleteAllNotifications = async (): Promise<{ message: string }> => {
    const { data } = await axiosInstance.delete(endpoints.notification.deleteAll);
    return data;
};

// --- Admin-Only API Call ---

export const createNotification = async (payload: CreateNotificationPayload): Promise<{ message: string, notification: Notification }> => {
    const { data } = await axiosInstance.post(endpoints.notification.create, payload);
    return data;
};