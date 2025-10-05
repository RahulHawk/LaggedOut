export const endpoints = {
    cart: {
    get: "/cart", // From GET /
    add: "/cart/add", // From POST /add
    remove: (itemId: string) => `/cart/remove/${itemId}`, 
    createOrder: "/cart/create-order", 
    verifyPayment: "/cart/verify-payment", 
  },
  purchase: {
    createOrder: "/purchase/create-order", 
    verifyPayment: "/purchase/verify-payment", 
  },
}

export const successNotificationEndpoints: string[] = [
    endpoints.cart.get,
    endpoints.cart.add,
    endpoints.cart.remove("dummyId"),
    endpoints.cart.createOrder,
    endpoints.cart.verifyPayment,
    endpoints.purchase.createOrder,
    endpoints.purchase.verifyPayment
];

