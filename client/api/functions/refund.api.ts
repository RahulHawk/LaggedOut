// src/api/functions/refund.api.ts

import axiosInstance from '@/api/axios/axios';
import { endpoints } from '@/api/endPoints/refundEndpoints';
import { Refund, RequestRefundPayload, ReviewRefundPayload } from '@/typescript/refundTypes';

// --- User-Facing API Calls ---

/**
 * Submits a new refund request for a specific purchase.
 */
export const requestRefund = async (payload: RequestRefundPayload): Promise<{ message: string, refund: Refund }> => {
    const { data } = await axiosInstance.post(endpoints.refund.request, payload);
    return data;
};

/**
 * Fetches the current user's list of refund requests.
 */
export const listMyRefunds = async (): Promise<{ refunds: Refund[] }> => {
    const { data } = await axiosInstance.get(endpoints.refund.listMy);
    return data;
};


// --- Admin-Only API Calls ---

/**
 * Approves or rejects a specific refund request.
 */
export const reviewRefund = async ({ refundId, payload }: { refundId: string, payload: ReviewRefundPayload }): Promise<{ message: string, refund: Refund }> => {
    const { data } = await axiosInstance.post(endpoints.refund.review(refundId), payload);
    return data;
};

/**
 * Fetches a list of all refund requests in the system.
 */
export const listAllRefunds = async (): Promise<{ refunds: Refund[] }> => {
    const { data } = await axiosInstance.get(endpoints.refund.listAll);
    return data;
};