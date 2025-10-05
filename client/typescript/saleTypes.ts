import { User } from './authTypes';
import { Game } from './gameTypes'; // Assuming you have base types for Game and User

// Describes a game within a sale, as received from the API (populated)
export interface SaleGame {
  game: Game; // The populated game object
  discount: number;
  _id: string;
}

// Describes the payload for creating/updating a sale's game list
export interface SaleGamePayload {
  game: string; // The game's _id as a string
  discount: number;
}

// The main Sale type, representing data received from the API
export interface Sale {
  _id: string;
  title: string;
  description?: string;
  games: SaleGame[];
  startDate: string; // Using string for date to simplify transfers
  endDate: string;
  createdBy: User; // Populated user object
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// The payload for creating a new sale
export interface CreateSalePayload {
  title: string;
  description?: string;
  games: SaleGamePayload[];
  startDate: string;
  endDate: string;
}