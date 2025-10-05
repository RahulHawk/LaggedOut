// src/customHooks/notification.hooks.query.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import * as notificationApi from '@/api/functions/notification.api';
import { Notification, CreateNotificationPayload } from '@/typescript/notificationTypes';

const notificationKeys = {
    all: ['notifications'] as const,
};

// --- QUERY HOOK (for Players) ---

export const useNotificationsQuery = () => {
    return useQuery({
        queryKey: notificationKeys.all,
        queryFn: notificationApi.getUserNotifications,
        select: (data) => data.notifications, // Extract the array for easier use in components
    });
};

// --- MUTATION HOOKS (for Players) ---

export const useMarkAsReadMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (notificationId: string) => notificationApi.markAsRead(notificationId),
        onSuccess: (data) => {
            // For an instant UI update, manually update the cache
            queryClient.setQueryData<Notification[] | undefined>(notificationKeys.all, (oldData) => {
                return oldData?.map(n => n._id === data.notification._id ? { ...n, read: true } : n)
            });
        }
    });
};

export const useMarkAllAsReadMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: notificationApi.markAllAsRead,
        onSuccess: (data) => {
            toast.success(data.message);
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Action failed."),
    });
};

export const useDeleteNotificationMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (notificationId: string) => notificationApi.deleteNotification(notificationId),
        onSuccess: (data) => {
            toast.info(data.message);
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Failed to delete notification."),
    });
};

export const useDeleteAllNotificationsMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: notificationApi.deleteAllNotifications,
        onSuccess: (data) => {
            toast.info(data.message);
            // Set the cache to an empty array
            queryClient.setQueryData(notificationKeys.all, []);
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Failed to delete notifications."),
    });
};

// --- MUTATION HOOK (for Admins) ---

export const useCreateNotificationMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateNotificationPayload) => notificationApi.createNotification(payload),
        onSuccess: () => {
            toast.success("Notification created successfully!");
            // No need to invalidate here unless an admin is also a user who can see the notification
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Failed to create notification."),
    });
};