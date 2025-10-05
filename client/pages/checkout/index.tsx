// src/pages/checkout/index.tsx

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
    Container,
    Box,
    Typography,
    CircularProgress,
    Alert,
    Button,
    Paper,
    Divider,
    Backdrop,
} from '@mui/material';

import { useGame } from '@/customHooks/game.hooks.query';
import {
    useCartQuery,
    useCreateCartOrderMutation,
    useCreateSingleItemOrderMutation,
    useVerifyCartPaymentMutation,
    useVerifySingleItemPaymentMutation,
} from '@/customHooks/commerce.hooks.query';
import { useRazorpay } from '@/customHooks/razorPay.hooks';
import { CheckOutLoader } from '@/components/common/CheckoutLoading';

const CheckoutPage = () => {
    const router = useRouter();
    const { gameId: rawGameId, editionId: rawEditionId, dlcId: rawDlcId } = router.query;

    const gameId = Array.isArray(rawGameId) ? rawGameId[0] : rawGameId;
    const editionId = Array.isArray(rawEditionId) ? rawEditionId[0] : rawEditionId;
    const dlcId = Array.isArray(rawDlcId) ? rawDlcId[0] : rawDlcId;
    const isBuyNow = !!gameId;

    // State for Buy Now summary
    const { data: gameData, isLoading: isGameLoading } = useGame(gameId as string | undefined);
    const [buyNowItem, setBuyNowItem] = useState<{ name: string, price: number } | null>(null);

    // State for Cart summary
    const { data: cartData, isLoading: isCartLoading } = useCartQuery();

    // Mutations
    const { mutate: createCartOrder, isPending: isCreatingCartOrder } = useCreateCartOrderMutation();
    const { mutate: createSingleItemOrder, isPending: isCreatingSingleOrder } = useCreateSingleItemOrderMutation();
    const { mutate: verifyCartPayment, isPending: isVerifyingCart } = useVerifyCartPaymentMutation();
    const { mutate: verifySingleItemPayment, isPending: isVerifyingSingle } = useVerifySingleItemPaymentMutation();

    // Payment Handler
    const handlePaymentSuccess = (response: { razorpay_payment_id: string }) => {
        const onSuccessRedirect = () => router.push('/order/success');

        if (isBuyNow) {
            const payload = { razorpay_payment_id: response.razorpay_payment_id, gameId, editionId, dlcId };
            verifySingleItemPayment(payload, { onSuccess: onSuccessRedirect });
        } else {
            const payload = { razorpay_payment_id: response.razorpay_payment_id };
            verifyCartPayment(payload, { onSuccess: onSuccessRedirect });
        }
    };

    const { openRazorpay } = useRazorpay(handlePaymentSuccess);

    const handlePlaceOrder = () => {
        const onSuccessCallback = (orderData: any) => {
            openRazorpay({
                orderId: orderData.orderId,
                amount: orderData.amount,
                currency: orderData.currency,
            });
        };

        if (isBuyNow) {
            createSingleItemOrder(
                { gameId, editionId, dlcId },
                { onSuccess: onSuccessCallback }
            );
        } else {
            createCartOrder(
                undefined,
                { onSuccess: onSuccessCallback }
            );
        }
    };

    // Effect to calculate Buy Now item details
    useEffect(() => {
        if (isBuyNow && gameData) {
            let price = gameData.onSale && gameData.salePrice ? gameData.salePrice : gameData.basePrice;
            let name = gameData.title;

            if (editionId) {
                const edition = gameData.editions.find(e => e._id === editionId);
                if (edition) {
                    name += ` - ${edition.name}`;
                    price = edition.price;
                }
            }
            // You can add DLC price logic here if needed
            setBuyNowItem({ name, price });
        }
    }, [isBuyNow, gameData, editionId, dlcId]);

    const currencyFormatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    });

    const renderSummary = () => {
        if ((isBuyNow && isGameLoading) || (!isBuyNow && isCartLoading)) {
            return (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }}>Loading Summary...</Typography>
                </Paper>
            );
        }

        const items = isBuyNow
            ? (buyNowItem ? [{ name: buyNowItem.name, price: buyNowItem.price }] : [])
            : cartData?.cart.map(item => ({ name: `${item.gameTitle} - ${item.editionName}`, price: item.price })) || [];

        const total = isBuyNow
            ? (buyNowItem ? buyNowItem.price : 0)
            : cartData?.totalPrice || 0;

        if (items.length === 0) {
            return <Alert severity="warning">No items to checkout. Redirecting...</Alert>;
        }

        return (
            <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>Order Summary</Typography>
                {items.map((item, index) => (
                    <Box key={index} display="flex" justifyContent="space-between" my={1}>
                        <Typography>{item.name}</Typography>
                        <Typography>{currencyFormatter.format(item.price)}</Typography>
                    </Box>
                ))}
                <Divider sx={{ my: 2 }} />
                <Box display="flex" justifyContent="space-between">
                    <Typography variant="h6">Total</Typography>
                    <Typography variant="h6">{currencyFormatter.format(total)}</Typography>
                </Box>
                <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    sx={{ mt: 3 }}
                    onClick={handlePlaceOrder}
                    disabled={isCreatingCartOrder || isCreatingSingleOrder || isVerifyingCart || isVerifyingSingle}
                >
                    {(isCreatingCartOrder || isCreatingSingleOrder)
                        ? "Preparing Order..."
                        : "Place Order"
                    }
                </Button>
            </Paper>
        );
    };

    const isVerifying = isVerifyingCart || isVerifyingSingle;

    return (
        <>
            <Head><title>Checkout | LaggedOut</title></Head>
            {isVerifying && (
                <Backdrop open={true} sx={{ zIndex: (theme) => theme.zIndex.drawer + 9999, color: '#fff' }}>
                    <Box textAlign="center">
                        <CheckOutLoader />
                        <Typography sx={{ mt: 2 }}>Verifying Payment... Do not close this window.</Typography>
                    </Box>
                </Backdrop>
            )}
            <Box sx={{ display: 'flex', bgcolor: "#1b2838", minHeight: '80vh' }}>
                <Container maxWidth="sm" sx={{ mt: 30 }}>
                    {renderSummary()}
                </Container>
            </Box>
        </>
    );
};

export default CheckoutPage;