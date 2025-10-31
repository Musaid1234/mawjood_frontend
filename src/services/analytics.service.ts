import axiosInstance from '@/lib/axios';
import { AxiosError } from 'axios';

export interface DashboardStats {
  totalListings: number;
  activeListings: number;
  pendingListings: number;
  totalViews: number;
  todayViews: number;
  totalReviews: number;
  averageRating: number;
  totalFavourites: number;
  totalBlogs: number;
}

export interface ViewsTrend {
  date: string;
  count: number;
}

export interface RecentReview {
  id: string;
  rating: number;
  comment: string | null;
  businessName: string;
  userName: string;
  userAvatar: string | null;
  createdAt: string;
}

export interface DashboardResponse {
  success: boolean;
  data: {
    overview: DashboardStats;
    viewsTrend: ViewsTrend[];
    recentReviews: RecentReview[];
  };
}

const handleError = (error: unknown): never => {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    throw new Error(message);
  }
  throw error;
};

export const analyticsService = {
  async getDashboardStats(): Promise<DashboardResponse> {
    try {
      const response = await axiosInstance.get<DashboardResponse>('api/analytics/dashboard');
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },
};