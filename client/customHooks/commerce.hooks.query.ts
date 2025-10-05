
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import * as commerceApi from '@/api/functions/commerce.api';

// --- QUERY HOOK ---


export const useCartQuery = (options?: object) => {
    return useQuery({
        queryKey: ['cart'],
        queryFn: commerceApi.getCart,
        staleTime: 1000 * 60 * 5,
        ...options, 
    });
};


// --- MUTATION HOOKS ---

export const useAddToCartMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: commerceApi.addToCart,
        onSuccess: (data) => {
            toast.success(data.message || "Item added to cart!");
            // This tells react-query to refetch the cart data automatically
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to add item.");
        }
    });
};

/**
 * Hook for the "Remove from Cart" action.
 */
export const useRemoveFromCartMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: commerceApi.removeFromCart,
        onSuccess: (data) => {
            toast.info(data.message || "Item removed from cart.");
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to remove item.");
        }
    });
};


export const useCreateCartOrderMutation = () => {
    return useMutation({
        mutationFn: commerceApi.createCartOrder, 
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Could not create order from cart.");
        }
    });
};

export const useCreateSingleItemOrderMutation = () => {
    return useMutation({
        mutationFn: commerceApi.createSingleItemOrder, 
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Could not create order.");
        }
    });
};


export const useVerifySingleItemPaymentMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: commerceApi.verifySingleItemPayment,
        onSuccess: () => {
            toast.success("Purchase successful! Item has been added to your library.");
            // Refetch user data to update the library
            queryClient.invalidateQueries({ queryKey: ['user'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Payment verification failed.");
        }
    });
};

export const useVerifyCartPaymentMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: commerceApi.verifyCartPayment,
        onSuccess: () => {
            toast.success("Purchase successful! Your items have been added to your library.");
            // Refetch cart (to empty it) and user data (to update library)
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            queryClient.invalidateQueries({ queryKey: ['user'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Payment verification failed.");
        }
    });
};

export const usePurchaseHistoryQuery = (gameId: string | undefined) => {
    return useQuery({
        queryKey: ['purchaseHistory', gameId],
        queryFn: () => commerceApi.getPurchaseHistoryForGame(gameId!),
        enabled: !!gameId,
    });
};

export const useMyPurchaseHistoryQuery = () => {
    return useQuery({
        queryKey: ['purchaseHistory', 'my'],
        queryFn: commerceApi.getMyPurchaseHistory,
        select: (data) => data.purchases, // Extract the array for easier use
    });
};