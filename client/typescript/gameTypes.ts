// Base types for referenced data, simplified for frontend use
export interface Genre {
    _id: string;
    name: string;
}

export interface Tag {
    _id: string;
    name: string;
}

export interface Developer {
    _id: string;
    firstName: string;
    lastName: string;
}

export interface Avatar {
    _id: string;
    name: string;
    imageUrl: string;
}

// Sub-document types
export interface SystemRequirements {
    minimum?: string;
    recommended?: string;
}

export interface BonusContent {
    avatars?: Avatar[]; // Populated avatar objects
}

export interface Dlc {
    _id: string;
    title: string;
    description?: string;
    price: number;
    coverImage?: string;
    screenshots?: string[];
    trailer?: string;
    releaseDate?: string; // Using string for date to simplify transfers
    systemRequirements?: SystemRequirements;
    bonusContent?: {
        avatars?: string[]; // IDs
    };
    developer: string; // ID
    approved: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Edition {
    _id: string;
    name: string;
    description?: string;
    price: number;
    coverImage?: string;
    bonusContent?: {
        avatars?: string[]; // IDs
    };
    includesDLCs?: string[]; // IDs of DLCs
    createdAt: string;
    updatedAt: string;
    approved: boolean;
}

// The main Game type, representing data received from the API
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
    bonusContent?: {
        avatars?: string[]; // IDs
    };
    genre: Genre[]; // Populated genre objects
    tags: Tag[];   // Populated tag objects
    systemRequirements?: SystemRequirements;
    averageRating: number;
    totalReviews: number;
    developer: Developer; // Populated developer object
    approved: boolean;
    dlcs: Dlc[];
    editions: Edition[];
    createdAt: string;
    updatedAt: string;
    bonusAvatars?: Avatar[]; 
    editionBadges?: any[];
}


// Types for API payloads (data we send to the server)
// Note: These use string arrays for IDs and omit server-generated fields

export type CreateGamePayload = Omit<Game, '_id' | 'developer' | 'approved' | 'averageRating' | 'totalReviews' | 'createdAt' | 'updatedAt' | 'genre' | 'tags' | 'dlcs' | 'editions'> & {
    genre: string[]; // Array of genre IDs
    tags?: string[]; // Array of tag IDs
};

export type AddDlcPayload = {
    title: string;
    description?: string;
    price: number;
    releaseDate?: string;
    systemRequirements?: SystemRequirements;
    // Files like coverImage, screenshots, trailer, avatar will be in FormData
};

export type AddEditionPayload = {
    name: string;
    description?: string;
    price: number;
    includesDLCs?: string[]; // Array of DLC IDs
    // Files will be in FormData
};