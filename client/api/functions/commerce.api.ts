// src/api/commerceApi.ts

import axiosInstance from '@/api/axios/axios';
import { endpoints } from '@/api/endPoints/commerceEndpoints';
import {
  CartData,
  AddToCartPayload,
  CreateSingleOrderPayload,
  CreateOrderResponse,
  VerifySinglePaymentPayload,
  VerifyCartPaymentPayload,
  Purchase
} from '@/typescript/commerceTypes';

// --- Cart API Calls ---

/**
 * Fetches the user's current cart contents.
 */
export const getCart = async (): Promise<CartData> => {
  const response = await axiosInstance.get<CartData>(endpoints.cart.get);
  return response.data;
};

/**
 * Adds a new item to the user's cart.
 */
export const addToCart = async (payload: AddToCartPayload): Promise<{ message: string }> => {
  const response = await axiosInstance.post(endpoints.cart.add, payload);
  return response.data;
};

/**
 * Removes an item from the user's cart by its unique cart item ID.
 */
export const removeFromCart = async (itemId: string): Promise<{ message: string }> => {
  const response = await axiosInstance.delete(endpoints.cart.remove(itemId));
  return response.data;
};

/**
 * Creates a Razorpay order for the entire cart.
 */
export const createCartOrder = async (): Promise<CreateOrderResponse> => {
    const response = await axiosInstance.post(endpoints.cart.createOrder);
    return response.data;
};

/**
 * Verifies a Razorpay payment for a cart checkout.
 */
export const verifyCartPayment = async (payload: VerifyCartPaymentPayload): Promise<{ purchases: Purchase[] }> => {
    const response = await axiosInstance.post(endpoints.cart.verifyPayment, payload);
    return response.data;
};


// --- Single Purchase API Calls ---

export const createSingleItemOrder = async (payload: CreateSingleOrderPayload): Promise<CreateOrderResponse> => {
    const response = await axiosInstance.post(endpoints.purchase.createOrder, payload);
    return response.data;
};

export const verifySingleItemPayment = async (payload: VerifySinglePaymentPayload): Promise<{ purchase: Purchase }> => {
    const response = await axiosInstance.post(endpoints.purchase.verifyPayment, payload);
    return response.data;
};

export const getPurchaseHistoryForGame = async (gameId: string): Promise<Purchase[]> => {
    const response = await axiosInstance.get(`/purchase/history/${gameId}`);
    return response.data.purchases;
};

export const getMyPurchaseHistory = async (): Promise<{ purchases: Purchase[] }> => {
    const { data } = await axiosInstance.get('/purchase/my-history');
    return data;
};