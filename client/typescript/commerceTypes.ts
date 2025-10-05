// src/types/commerce.ts

import { Game } from "./homeTypes";

// The structure of a single item returned by the GET /cart endpoint
export interface CartItem {
  id: string;
  gameId: string;
  editionId?: string;
  dlcId?: string;
  gameTitle: string;
  editionName: string;
  dlcTitle: string | null;
  price: number;
  coverImage: string;
}

// The full response from the GET /cart endpoint
export interface CartData {
  cart: CartItem[];
  totalPrice: number;
}

// Payload for adding an item to the cart
export interface AddToCartPayload {
  gameId: string;
  editionId?: string;
  dlcId?: string;
}

// Payload for creating a single-item "Buy Now" order
export interface CreateSingleOrderPayload extends AddToCartPayload {}

// Response from creating a Razorpay order (for cart or single item)
export interface CreateOrderResponse {
  status: boolean;
  orderId: string;
  amount: number;
  currency: string;
  // These are optional and might vary between cart/single item
  cartDetails?: any[];
  edition?: string;
  dlcTitle?: string | null;
}

// The structure of a completed purchase record
export interface Purchase {
    _id: string;
    user: string;
    game: Game;
    edition: string;
    dlc: string | null;
    pricePaid: number;
    transactionId: string;
    purchasedAt: string;
}

// Payload for verifying a single-item payment
export interface VerifySinglePaymentPayload {
  razorpay_payment_id: string;
  gameId: string;
  editionId?: string;
  dlcId?: string;
}

// Payload for verifying a cart payment
export interface VerifyCartPaymentPayload {
    razorpay_payment_id: string;
}