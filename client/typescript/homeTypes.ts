export interface Developer {
  _id: string;
  firstName: string;
  lastName: string;
  profile?: {
    avatarUrl?: string;
  };
}

export interface DevelopersResponse {
  message: string;
  data: Developer[];
}

export interface Genre {
  _id: string;
  name: string;
}

export interface Tag {
  _id: string;
  name: string;
}

export interface SystemRequirements {
  minimum: string;
  recommended: string;
}

export interface StarBreakdown {
  "5": number;
  "4": number;
  "3": number;
  "2": number;
  "1": number;
}

export interface DLC {
  _id: string;
  title: string;
  description?: string;
  price: number;
  coverImage?: string;
  screenshots?: string[];
  releaseDate?: string;
  developer: Developer | string;
}

export interface Edition {
  _id: string;
  name: string;
  description?: string;
  price: number;
  coverImage?: string;
  includesDLCs?: (DLC | string)[];
}

export interface Game {
  _id: string;
  title: string;
  description?: string;
  basePrice: number;
  salePrice?: number;
  onSale: boolean;
  coverImage: string;
  screenshots?: string[];
  trailer?: string;
  websiteUrl?: string;
  releaseDate?: string;
  genre: Genre[];
  tags: Tag[];
  systemRequirements?: SystemRequirements;
  averageRating: number;
  totalReviews: number;
  starBreakdown?: StarBreakdown;
  developer: Developer;
  approved: boolean;
  dlcs: DLC[];
  editions: Edition[];
  createdAt: string;
  updatedAt: string;
}


export interface GameRecommendation {
  _id: string;
  title: string;
  coverImage: string;
  screenshots?: string[];
}


export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetAllGamesResponse {
  status: boolean;
  data: Game[];
  pagination: Pagination;
}

export interface RecommendationsData {
  recentlyViewed: GameRecommendation[];
  recommendedByFriends: GameRecommendation[];
  recommendedBySimilarity: GameRecommendation[];
  recommendedByFollowing: GameRecommendation[];
}

export interface GetRecommendationsResponse {
  success: boolean;
  message: string;
  status: number;
  data: RecommendationsData;
}

export interface LibraryItem {
  game: Game;
  addedAt: string; 
}

export interface WishlistItem {
  game: Game;
  addedAt: string; 
}

export interface ApiResponse<T> {
  status: boolean;
  data: T;
  message?: string;
}