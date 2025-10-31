/**
 * Auth Service
 * Handles all authentication-related API calls
 */

import axiosInstance from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api.config';
import { AxiosError } from 'axios';

// Types
export interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'BUSINESS_OWNER' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  avatar: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    refreshToken: string;
  };
}

export interface RegisterData {
  email: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'USER' | 'BUSINESS_OWNER';
}

export interface LoginData {
  identifier: string; // email or phone
  password: string;
}

export interface OTPVerifyData {
  email?: string;
  phone?: string;
  otp: string;
}

// Error handler
const handleError = (error: unknown): never => {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    throw new Error(message);
  }
  throw error;
};

// Auth Service
export const authService = {
  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, data);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Login with password
   */
  async loginWithPassword(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, data);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Send OTP to email
   */
  async sendEmailOTP(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.SEND_EMAIL_OTP, { email });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Send OTP to phone
   */
  async sendPhoneOTP(phone: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.SEND_PHONE_OTP, { phone });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Verify email OTP and login
   */
  async verifyEmailOTP(data: OTPVerifyData): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<AuthResponse>(
        API_ENDPOINTS.AUTH.LOGIN_OTP_EMAIL,
        data
      );
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Verify phone OTP and login
   */
  async verifyPhoneOTP(data: OTPVerifyData): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<AuthResponse>(
        API_ENDPOINTS.AUTH.LOGIN_OTP_PHONE,
        data
      );
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<{ success: boolean; message: string; data: User }> {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.AUTH.ME);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },
};