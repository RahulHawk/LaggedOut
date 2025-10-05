import { useEffect, useState } from 'react';
import { useAuth } from '@/customHooks/auth.hooks.query'; 

const loadScript = (src: string) => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    handler: (response: any) => void;
    prefill: {
        name?: string;
        email?: string;
        contact?: string;
    };
    notes?: object;
    theme: {
        color: string;
    };
}

/**
 * Hook to handle Razorpay payment flow.
 * @param onSuccess Callback function to be executed with the payment response after successful payment.
 */
export const useRazorpay = (onSuccess: (response: any) => void) => {
    const { user } = useAuth();
    const [isScriptLoaded, setScriptLoaded] = useState(false);

    useEffect(() => {
        const load = async () => {
            const result = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
            if (!result) {
                console.error("Razorpay SDK failed to load. Are you online?");
            } else {
                setScriptLoaded(true);
            }
        };
        load();
    }, []);
    
    const openRazorpay = (orderData: { orderId: string, amount: number, currency: string }) => {
        if (!isScriptLoaded) {
            console.error("Razorpay script not loaded yet.");
            return;
        }

        const options: RazorpayOptions = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!, // IMPORTANT: Store your key in .env.local
            amount: orderData.amount,
            currency: orderData.currency,
            name: "LaggedOut Store",
            description: "Game Purchase Transaction",
            order_id: orderData.orderId,
            handler: onSuccess,
            prefill: {
                name: user?.firstName,
                email: user?.email,
            },
            theme: {
                color: "#66c0f4",
            },
        };

        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.open();
    };

    return { openRazorpay };
};