import axiosInstance from "@/api/axios/axios";
import { saleEndpoints } from "@/api/endPoints/saleEndpoints";
import { Sale, CreateSalePayload } from "@/typescript/saleTypes";

// Fetch all sales (for admin/developer view)
export const getAllSales = async (): Promise<Sale[]> => {
  const response = await axiosInstance.get(saleEndpoints.getAll);
  return response.data; // Assuming the backend returns the array directly
};

// Fetch only active sales (for public view)
export const getActiveSales = async (): Promise<Sale[]> => {
  const response = await axiosInstance.get(saleEndpoints.getActive);
  return response.data;
};

// Create a new sale
export const createSale = async (payload: CreateSalePayload): Promise<{ message: string; sale: Sale }> => {
  const response = await axiosInstance.post(saleEndpoints.create, payload);
  return response.data;
};

// Manually activate a sale
export const activateSale = async (saleId: string): Promise<{ message: string }> => {
  const response = await axiosInstance.post(saleEndpoints.activate(saleId));
  return response.data;
};

// Manually deactivate a sale
export const deactivateSale = async (saleId: string): Promise<{ message: string }> => {
  const response = await axiosInstance.post(saleEndpoints.deactivate(saleId));
  return response.data;
};