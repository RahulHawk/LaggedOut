import { Avatar } from "./achievementTypes";
import { Game, LibraryItem } from "./homeTypes";

export interface Profile {
  bio: string;
  displayAvatar: string;
  theme: string;
}

export interface Stats {
  gamesOwned: number;
  achievementsUnlocked: number;
  friendsCount: number;
}

export interface ShowcaseGame {
  _id: string;
  title: string;
  coverImage: string;
}

export interface Activity {
  _id: string;
  game: {
    title: string;
  };
  type: string;
  createdAt: string;
}

export interface Friend {
  id: string;
  name: string;
  avatar: string;
}

export interface MyProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  displayName: string;
  fullName: string;
  role: string;
  isUsernameSet: boolean;
  userName?: string;
  profile: {
    bio: string;
    theme: string;
    privacy: "public" | "friends" | "private";
    showcaseGames: Game[];
    profilePic: string;
    selectedAvatar: string | null;
    displayAvatar: string;
  };
  stats: {
    gamesOwned: number;
    wishlistCount: number;
    achievementsUnlocked: number;
    friendsCount: number;
  };
  authProviders: {
    provider: 'local' | 'google';
    providerId?: string;
  }[];
  recentActivity: Activity[];
  achievements: Achievement[];
  friends: Friend[];
  library: LibraryItem[];
  inventory: {
    avatars: Avatar[];
    badges: Badge[];
  }
}
;
export interface MyProfileResponse {
  status: boolean;
  data: MyProfileData;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  userName?: string;
  bio?: string;
  privacy?: "public" | "friends" | "private";
  showcaseGames?: string[];
  selectedAvatar?: string;
  profilePic?: File;
}

export interface UpdatePasswordPayload {
  currentPassword?: string;
  newPassword: string;
}

export interface UpdateEmailPayload {
  newEmail: string;
}

export interface Badge {
  _id: string;
  name: string;
  description: string;
  image: string;
}

export interface Achievement {
  _id: string;
  achievement: {
    _id: string;
    badge: Badge;
  };
  unlockedAt: string;
}

export interface PlayerProfile {
  id: string;
  displayName: string;
  profile: {
    displayAvatar: string;
    bio?: string;
  };
  stats?: {
    gamesOwned: number;
    wishlistCount: number;
    achievementsUnlocked: number;
    friendsCount: number;
  };
  // You can add other full profile fields here
  // e.g., showcaseGames: ShowcaseGame[];
}

export interface PlayerProfileResponse {
  status: boolean;
  limited: boolean; // This flag is crucial for the UI
  data: PlayerProfile;
}

// Add these new interfaces to your existing types file

export interface DeveloperGame {
  _id: string;
  title: string;
  coverImage: string;
  genres: { name: string }[];
  tags: { name: string }[];
}

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface DeveloperProfileData {
  id: string;
  firstName: string;
  lastName: string;
  isFollowedByCurrentUser: boolean;
  profile: {
    bio: string;
    displayAvatar: string;
  };
  stats: {
    totalGames: number;
    totalSales: number;
    avgRating: string | number;
    followerCount: number;
  };
  uploadedGames: DeveloperGame[];
  announcements: Announcement[];
}

export interface DeveloperProfileResponse {
  status: boolean;
  data: DeveloperProfileData;
}

// This new type will be for our role-checking endpoint
export interface UserRoleResponse {
  role: 'player' | 'developer' | 'admin' | 'not_found';
}

export interface MyDeveloperProfileData {
  id: string;
  displayName: string;
  stats: {
    totalGames: number;
    totalSales: number;
    avgRating: string | number;
  };
  profile: {
    bio: string;
    displayAvatar: string;
    profilePic: string;
    privacy: "public" | "private";
  };
  uploadedGames: {
    _id: string;
    title: string;
    coverImage: string;
    status: 'published' | 'draft' | 'under-review';
  }[];
}

export interface MyDeveloperProfileResponse {
  status: boolean;
  data: MyDeveloperProfileData;
}

export interface Follower {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string;
  role: 'player';
}

// Also add a type for the full API response
export interface FollowersApiResponse {
  status: boolean;
  data: Follower[];
}

// Add these interfaces to your types file

export interface GameRevenue {
  gameId: string;
  gameTitle: string;
  totalRevenue: number;
  salesCount: number;
}

export interface DeveloperAnalyticsData {
  totalRevenue: number;
  revenueByGame: GameRevenue[];
}

export interface DeveloperAnalyticsResponse {
  status: boolean;
  data: DeveloperAnalyticsData;
}