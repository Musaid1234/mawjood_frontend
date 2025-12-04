/**
 * Admin Service
 * Handles all admin-related API calls
 */

import axiosInstance from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api.config';
import { AxiosError } from 'axios';

// Types
export interface DashboardStats {
  overview: {
    totalUsers: number;
    totalBusinesses: number;
    totalReviews: number;
    totalPayments: number;
  };
  businessStatus: {
    pending: number;
    approved: number;
    rejected: number;
    suspended: number;
  };
  payments: {
    total: number;
    completed: number;
    pending: number;
    totalRevenue: number;
  };
  system: {
    totalCategories: number;
    totalCities: number;
    totalRegions: number;
    activeAdmins: number;
  };
  charts: {
    businessGrowth: Array<{
      month: string;
      year: number;
      count: number;
    }>;
    businessesByCategory: Array<{
      categoryId: string;
      categoryName: string;
      count: number;
    }>;
    businessesByCity: Array<{
      cityId: string;
      cityName: string;
      count: number;
    }>;
    businessesByRegion: Array<{
      regionId: string;
      regionName: string;
      count: number;
    }>;
  };
  pendingApprovals: Array<{
    id: string;
    name: string;
    slug: string;
    status: string;
    createdAt: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
    category: {
      name: string;
    };
    city: {
      name: string;
    };
  }>;
  recentUsers: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    status: string;
    createdAt: string;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Error handler
const handleError = (error: unknown): never => {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    throw new Error(message);
  }
  throw error;
};

// Admin Service
export const adminService = {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    try {
      const response = await axiosInstance.get<ApiResponse<DashboardStats>>(
        API_ENDPOINTS.ADMIN.DASHBOARD
      );
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get analytics data
   */
  async getAnalytics(): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.ANALYTICS);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get all users
   */
  async getAllUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.GET_ALL_USERS, { params });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.GET_USER_BY_ID(userId));
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get pending businesses
   */
  async getPendingBusinesses(params?: { page?: number; limit?: number }): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.GET_PENDING_BUSINESSES, {
        params,
      });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Update user status
   */
  async updateUserStatus(userId: string, status: string): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.patch(API_ENDPOINTS.ADMIN.UPDATE_USER_STATUS(userId), {
        status,
      });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Update user role
   */
  async updateUserRole(userId: string, role: string): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.patch(API_ENDPOINTS.ADMIN.UPDATE_USER_ROLE(userId), {
        role,
      });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Update user details
   */
  async updateUser(userId: string, data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.put(API_ENDPOINTS.ADMIN.UPDATE_USER(userId), data);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.delete(API_ENDPOINTS.ADMIN.DELETE_USER(userId));
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get all businesses (admin)
   */
  async getAllBusinesses(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.BUSINESSES.GET_ALL + '/admin/all', {
        params,
      });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Suspend business
   */
  async suspendBusiness(businessId: string): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.patch(API_ENDPOINTS.ADMIN.SUSPEND_BUSINESS(businessId));
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Approve business
   */
  async approveBusiness(businessId: string): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.patch(API_ENDPOINTS.BUSINESSES.APPROVE(businessId));
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Reject business
   */
  async rejectBusiness(businessId: string, reason?: string): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.patch(API_ENDPOINTS.BUSINESSES.REJECT(businessId), {
        reason,
      });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Toggle verified status (only for approved businesses)
   */
  async toggleVerifiedStatus(businessId: string, isVerified: boolean): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.patch(API_ENDPOINTS.ADMIN.VERIFY_BUSINESS(businessId), {
        isVerified,
      });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get all reviews (admin)
   */
  async getAllReviews(params?: {
    page?: number;
    limit?: number;
    search?: string;
    deleteRequestStatus?: string;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.GET_ALL_REVIEWS, { params });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get pending delete requests
   */
  async getPendingDeleteRequests(params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.GET_PENDING_DELETE_REQUESTS, {
        params,
      });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Approve delete request
   */
  async approveDeleteRequest(reviewId: string): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.patch(API_ENDPOINTS.ADMIN.APPROVE_DELETE_REQUEST(reviewId));
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Reject delete request
   */
  async rejectDeleteRequest(reviewId: string): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.patch(API_ENDPOINTS.ADMIN.REJECT_DELETE_REQUEST(reviewId));
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get all payments (admin)
   */
  async getAllPayments(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.PAYMENTS.GET_ALL, { params });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get all subscriptions (admin)
   */
  async getAllSubscriptions(params?: {
    page?: number;
    limit?: number;
    status?: string;
    businessId?: string;
    search?: string;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.SUBSCRIPTIONS.GET_ALL_ADMIN, { params });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },
};

