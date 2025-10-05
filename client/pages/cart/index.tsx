// src/pages/cart/index.tsx

import React from 'react';
import Head from 'next/head';
import NextLink from 'next/link';
import {
    Container,
    Box,
    Typography,
    Alert,
    Button,
    Paper,
    Link,
    IconButton,
    Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

import { useCartQuery, useRemoveFromCartMutation } from '@/customHooks/commerce.hooks.query';
import { Sidebar } from '@/components/Sidebar/Sidebar'; // Assuming you reuse the sidebar
import { CartLoading } from '@/components/common/CartLoading';

const CartPage = () => {
    const { data: cartData, isLoading, isError, error } = useCartQuery();
    const { mutate: removeFromCart, isPending: isRemoving } = useRemoveFromCartMutation();

    const currencyFormatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    });
    
    // Define categories for the sidebar if you're using it here
    const categories = [
        { key: "recentlyAdded", label: "Recently Added" },
        { key: "recentlyUpdated", label: "Recently Updated" },
    ];

    const renderContent = () => {
        if (isLoading) {
            return <CartLoading />;
        }
        if (isError) {
            return <Alert severity="error">{(error as any)?.message || "Failed to load cart."}</Alert>;
        }
        if (!cartData || cartData.cart.length === 0) {
            return (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h5" gutterBottom>Your Cart is Empty</Typography>
                    <Typography color="text.secondary">Looks like you haven't added anything to your cart yet.</Typography>
                    <NextLink href="/" passHref>
                        <Button variant="contained" sx={{ mt: 3 }}>Continue Shopping</Button>
                    </NextLink>
                </Paper>
            );
        }

        return (
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
                {/* Cart Items */}
                <Box flex={3}>
                    <Typography variant="h4" gutterBottom>Shopping Cart</Typography>
                    <Paper>
                        {cartData.cart.map((item, index) => (
                            <React.Fragment key={item.id}>
                                <Box sx={{ display: 'flex', alignItems: 'center', p: 2, gap: 2 }}>
                                    <Box
                                        component="img"
                                        src={item.coverImage}
                                        alt={item.gameTitle}
                                        sx={{ width: 60, height: 90, objectFit: 'cover', borderRadius: 1 }}
                                    />
                                    <Box flexGrow={1}>
                                        <Typography variant="h6">{item.gameTitle}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {item.editionName} {item.dlcTitle && `+ ${item.dlcTitle}`}
                                        </Typography>
                                    </Box>
                                    <Typography variant="h6" sx={{ minWidth: '100px', textAlign: 'right' }}>
                                        {currencyFormatter.format(item.price)}
                                    </Typography>
                                    <IconButton
                                        aria-label="remove"
                                        onClick={() => removeFromCart(item.id)}
                                        disabled={isRemoving}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                                {index < cartData.cart.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                    </Paper>
                </Box>

                {/* Order Summary */}
                <Box flex={1}>
                    <Typography variant="h4" gutterBottom>Summary</Typography>
                    <Paper sx={{ p: 3 }}>
                        <Box display="flex" justifyContent="space-between" mb={2}>
                            <Typography variant="h6">Subtotal</Typography>
                            <Typography variant="h6">{currencyFormatter.format(cartData.totalPrice)}</Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Taxes and shipping calculated at checkout.
                        </Typography>
                        <NextLink href="/checkout" passHref>
                            <Button variant="contained" size="large" fullWidth>
                                Proceed to Checkout
                            </Button>
                        </NextLink>
                    </Paper>
                </Box>
            </Box>
        );
    };

    return (
        <>
            <Head><title>Shopping Cart | LaggedOut</title></Head>
            <Box sx={{ display: 'flex', bgcolor: "#1b2838", minHeight: '100vh' }}>
                <Sidebar categories={categories} />
                <Box component="main" sx={{ flexGrow: 1, marginLeft: '240px', p: 4 }}>
                    <Container maxWidth="lg">
                        {renderContent()}
                    </Container>
                </Box>
            </Box>
        </>
    );
};

export default CartPage;