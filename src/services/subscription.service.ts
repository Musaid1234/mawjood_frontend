import axiosInstance from '@/lib/axios';
import axios from 'axios';
import { API_ENDPOINTS } from '@/config/api.config';

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: string | number; // Prisma Decimal comes as string
  salePrice?: string | number; // Prisma Decimal comes as string
  currency: string;
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  billingInterval: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR' | 'CUSTOM';
  intervalCount: number;
  customIntervalDays?: number;
  verifiedBadge: boolean;
  topPlacement: boolean;
  allowAdvertisements: boolean;
  maxAdvertisements?: number;
  couponCode?: string;
  couponType: 'NONE' | 'PERCENTAGE' | 'AMOUNT';
  couponValue?: string | number; // Prisma Decimal comes as string
  couponMaxDiscount?: string | number; // Prisma Decimal comes as string
  couponStartsAt?: string;
  couponEndsAt?: string;
  couponUsageLimit?: number;
  notes?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

// Helper function to safely convert Decimal (string) to number
export const parseDecimal = (value: string | number | undefined | null): number => {
  if (value === undefined || value === null) return 0;
  if (typeof value === 'number') return value;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

export interface BusinessSubscription {
  id: string;
  businessId: string;
  planId: string;
  status: 'PENDING' | 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'FAILED';
  startedAt: string;
  endsAt: string;
  cancelledAt?: string;
  price?: string | number; // Prisma Decimal comes as string
  discountAmount?: string | number; // Prisma Decimal comes as string
  totalAmount?: string | number; // Prisma Decimal comes as string
  paymentReference?: string;
  paymentProvider?: string;
  notes?: string;
  metadata?: any;
  plan?: SubscriptionPlan;
  business?: {
    id: string;
    name: string;
    slug: string;
    user?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionData {
  businessId: string;
  planId: string;
  startDate?: string;
  notes?: string;
  paymentReference?: string;
  paymentProvider?: string;
  metadata?: any;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    subscriptions?: T[];
    plans?: T[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

const handleError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    const customError = new Error(message);
    (customError as any).response = error.response;
    throw customError;
  }
  if (error instanceof Error) {
    throw error;
  }
  throw new Error('An unknown error occurred');
};

export const subscriptionService = {
  // Subscription Plans
  async getSubscriptionPlans(params?: { page?: number; limit?: number; status?: string }): Promise<PaginatedResponse<SubscriptionPlan>> {
    try {
      const response = await axiosInstance.get<PaginatedResponse<SubscriptionPlan>>(
        API_ENDPOINTS.SUBSCRIPTION_PLANS.GET_ALL,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      throw handleError(error);
    }
  },

  async getSubscriptionPlanById(id: string): Promise<ApiResponse<SubscriptionPlan>> {
    try {
      const response = await axiosInstance.get<ApiResponse<SubscriptionPlan>>(
        API_ENDPOINTS.SUBSCRIPTION_PLANS.GET_BY_ID(id)
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription plan:', error);
      throw handleError(error);
    }
  },

  // Business Subscriptions
  async getSubscriptions(params?: {
    page?: number;
    limit?: number;
    businessId?: string;
    status?: string;
  }): Promise<PaginatedResponse<BusinessSubscription>> {
    try {
      const response = await axiosInstance.get<PaginatedResponse<BusinessSubscription>>(
        API_ENDPOINTS.SUBSCRIPTIONS.GET_ALL,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      throw handleError(error);
    }
  },

  async getSubscriptionById(id: string): Promise<ApiResponse<BusinessSubscription>> {
    try {
      const response = await axiosInstance.get<ApiResponse<BusinessSubscription>>(
        API_ENDPOINTS.SUBSCRIPTIONS.GET_BY_ID(id)
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      throw handleError(error);
    }
  },

  async createSubscription(data: CreateSubscriptionData): Promise<ApiResponse<BusinessSubscription>> {
    try {
      const response = await axiosInstance.post<ApiResponse<BusinessSubscription>>(
        API_ENDPOINTS.SUBSCRIPTIONS.CREATE,
        data
      );
      return response.data;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw handleError(error);
    }
  },

  async cancelSubscription(id: string): Promise<ApiResponse<BusinessSubscription>> {
    try {
      const response = await axiosInstance.patch<ApiResponse<BusinessSubscription>>(
        API_ENDPOINTS.SUBSCRIPTIONS.CANCEL(id)
      );
      return response.data;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw handleError(error);
    }
  },

  // Admin - Get all subscriptions
  async getAllSubscriptions(params?: {
    page?: number;
    limit?: number;
    status?: string;
    businessId?: string;
    search?: string;
  }): Promise<PaginatedResponse<BusinessSubscription>> {
    try {
      const response = await axiosInstance.get<PaginatedResponse<BusinessSubscription>>(
        API_ENDPOINTS.SUBSCRIPTIONS.GET_ALL_ADMIN,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching all subscriptions:', error);
      throw handleError(error);
    }
  },

  // Subscription Plan Management (Admin)
  async createSubscriptionPlan(data: any): Promise<ApiResponse<SubscriptionPlan>> {
    try {
      const response = await axiosInstance.post<ApiResponse<SubscriptionPlan>>(
        API_ENDPOINTS.SUBSCRIPTION_PLANS.CREATE,
        data
      );
      return response.data;
    } catch (error) {
      console.error('Error creating subscription plan:', error);
      throw handleError(error);
    }
  },

  async updateSubscriptionPlan(id: string, data: any): Promise<ApiResponse<SubscriptionPlan>> {
    try {
      const response = await axiosInstance.patch<ApiResponse<SubscriptionPlan>>(
        API_ENDPOINTS.SUBSCRIPTION_PLANS.UPDATE(id),
        data
      );
      return response.data;
    } catch (error) {
      console.error('Error updating subscription plan:', error);
      throw handleError(error);
    }
  },

  async archiveSubscriptionPlan(id: string): Promise<ApiResponse<SubscriptionPlan>> {
    try {
      const response = await axiosInstance.delete<ApiResponse<SubscriptionPlan>>(
        API_ENDPOINTS.SUBSCRIPTION_PLANS.ARCHIVE(id)
      );
      return response.data;
    } catch (error) {
      console.error('Error archiving subscription plan:', error);
      throw handleError(error);
    }
  },
};

