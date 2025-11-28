import axiosInstance from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api.config';

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  paymentMethod?: string;
  transactionId?: string;
  description?: string;
  userId: string;
  businessId: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  business?: {
    id: string;
    name: string;
    slug: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentData {
  businessId: string;
  amount: number;
  currency?: string;
  description?: string;
  returnUrl?: string;
}

export interface PaymentPageResponse {
  paymentId: string;
  redirectUrl: string;
  transactionRef: string;
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
    payments: T[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

const handleError = (error: unknown): never => {
  if (error instanceof Error) {
    throw error;
  }
  throw new Error('An unknown error occurred');
};

export const paymentService = {
  async getMyPayments(): Promise<Payment[]> {
    try {
      const response = await axiosInstance.get<ApiResponse<Payment[]>>(
        API_ENDPOINTS.PAYMENTS.GET_MY_PAYMENTS
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching my payments:', error);
      throw handleError(error);
    }
  },

  async getPaymentById(id: string): Promise<ApiResponse<Payment>> {
    try {
      const response = await axiosInstance.get<ApiResponse<Payment>>(
        API_ENDPOINTS.PAYMENTS.GET_BY_ID(id)
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw handleError(error);
    }
  },

  async getBusinessPayments(businessId: string): Promise<Payment[]> {
    try {
      const response = await axiosInstance.get<ApiResponse<Payment[]>>(
        API_ENDPOINTS.PAYMENTS.GET_BUSINESS_PAYMENTS(businessId)
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching business payments:', error);
      throw handleError(error);
    }
  },

  async createPayment(data: CreatePaymentData): Promise<ApiResponse<PaymentPageResponse>> {
    try {
      const response = await axiosInstance.post<ApiResponse<PaymentPageResponse>>(
        API_ENDPOINTS.PAYMENTS.CREATE,
        data
      );
      return response.data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw handleError(error);
    }
  },

  // Admin - Get all payments
  async getAllPayments(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<Payment>> {
    try {
      const response = await axiosInstance.get<PaginatedResponse<Payment>>(
        API_ENDPOINTS.PAYMENTS.GET_ALL,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching all payments:', error);
      throw handleError(error);
    }
  },
};

