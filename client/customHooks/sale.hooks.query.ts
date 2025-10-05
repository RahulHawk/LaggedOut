import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as saleApi from '@/api/functions/sale.api';
import { CreateSalePayload } from '@/typescript/saleTypes';
import { toast } from 'react-toastify';
import { useAppSelector } from '@/redux/store';

// A key factory for consistent query keys
export const saleKeys = {
    all: ['sales'] as const,
    active: ['sales', 'active'] as const,
};

// --- QUERY HOOKS ---

// Hook to fetch all sales
export const useGetAllSales = () => {
    return useQuery({
        queryKey: saleKeys.all,
        queryFn: saleApi.getAllSales,
        select: (data) => data || [], 
    });
};

// Hook to fetch only active sales
export const useGetActiveSales = () => {
    return useQuery({
        queryKey: saleKeys.active,
        queryFn: saleApi.getActiveSales,
    });
};


// --- MUTATION HOOKS ---

export const useSaleMutations = () => {
    const queryClient = useQueryClient();

    const invalidateSales = () => {
        queryClient.invalidateQueries({ queryKey: saleKeys.all });
        queryClient.invalidateQueries({ queryKey: saleKeys.active });
    };

    // Mutation for creating a new sale
    const createSaleMutation = useMutation({
        mutationFn: (payload: CreateSalePayload) => saleApi.createSale(payload),
        onSuccess: (data) => {
            toast.success(data.message);
            invalidateSales();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to create sale.");
        },
    });

    // Mutation for activating a sale
    const activateSaleMutation = useMutation({
        mutationFn: (saleId: string) => saleApi.activateSale(saleId),
        onSuccess: (data) => {
            toast.success(data.message);
            invalidateSales();
        },
        onError: (error) => {
            toast.error(error.message || "Sale could not be activated.");
        },
    });

    // Mutation for deactivating a sale
    const deactivateSaleMutation = useMutation({
        mutationFn: (saleId: string) => saleApi.deactivateSale(saleId),
        onSuccess: (data) => {
            toast.success(data.message);
            invalidateSales();
        },
        onError: (error) => {
            toast.error(error.message || "Sale could not be deactivated.");
        },
    });

    return {
        createSale: createSaleMutation.mutateAsync,
        isCreatingSale: createSaleMutation.isPending,
        activateSale: activateSaleMutation.mutateAsync,
        isActivatingSale: activateSaleMutation.isPending,
        deactivateSale: deactivateSaleMutation.mutateAsync,
        isDeactivatingSale: deactivateSaleMutation.isPending,
    };
};