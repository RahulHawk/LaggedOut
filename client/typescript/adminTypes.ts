import { User } from './authTypes';
import { Game } from './gameTypes'; // Assuming base types

// From getAdminProfile
export interface AdminStats {
  totalUsers: number;
  totalPlayers: number;
  totalDevelopers: number;
  totalGames: number;
  totalSales: number;
  totalRevenue: number;
}

export interface SalesDataPoint {
  _id: string; // Genre ID or Developer Name
  count?: number;
  revenue?: number;
  totalSales?: number;
  totalRevenue?: number;
}

export interface RecentActivity {
  _id: string;
  user: User;
  game: Game;
  activityType: string;
  createdAt: string;
}

export interface UserListItem {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  status: 'Active' | 'Pending' | 'Banned';
}

export interface BanHistoryEntry {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  action: 'ban' | 'unban';
  reason: string;
  admin: {
    id: string;
    name: string;
    email: string;
  };
  date: string;
}

export interface AdminProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  stats: AdminStats;
  salesByGenre: SalesDataPoint[];
  salesByDeveloper: SalesDataPoint[];
  recentActivities: RecentActivity[];
  developers: UserListItem[];
  players: UserListItem[];
  banHistory: BanHistoryEntry[];
}

// From getOverallAnalytics
export interface OverallAnalyticsData {
  users: {
    totalUsers: number;
    totalDevelopers: number;
    totalBanned: number;
    totalVerified: number;
  };
  games: {
    totalGames: number;
    gamesOnSale: number;
    gamesPerGenre: { genre: string; count: number }[];
  };
  reviews: Record<string, any>;
  sales: {
    totalActiveSales: number;
    upcomingSales: number;
  };
  purchases: {
    totalPurchases: number;
    totalRevenue: number;
  };
}

// Payloads for mutations
export interface BanUnbanPayload {
  reason: string;
}

export interface DevLinkRequest {
  id: string;
  name: string;
  email: string;
  requestedAt: string;
}