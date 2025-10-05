import { Game } from "./homeTypes";

export interface LibraryResponse {
    library: Game[];
}

export interface FavoritesResponse {
    favorites: Game[];
}

export interface WishlistResponse {
    wishlist: Game[];
}

export interface UpdateFavoritesResponse {
    message: string;
    favorites: string[];
}

export interface UpdateWishlistResponse {
    message: string;
    wishlist: string[];
}