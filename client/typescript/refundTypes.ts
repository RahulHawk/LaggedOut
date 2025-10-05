// src/types/refund.ts
import { User } from '@/typescript/authTypes'; // Assuming you have a base User type
import { Purchase } from './commerceTypes';

export type RefundStatus = "pending" | "approved" | "rejected";

export interface Refund {
    _id: string;
    user: User; // Populated for admins
    purchase: Purchase; // Populated
    reason: string;
    status: RefundStatus;
    reviewedBy?: User;
    reviewedAt?: string;
    createdAt: string;
}

// Payloads for mutation actions
export interface RequestRefundPayload {
    purchaseId: string;
    reason: string;
}

export interface ReviewRefundPayload {
    status: "approved" | "rejected";
}
