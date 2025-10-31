/**
 * Axios Instance Configuration
 * Centralized axios instance with interceptors for request/response handling
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL } from '@/config/api.config';

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from Zustand store via localStorage
    if (typeof window !== 'undefined') {
      try {
        const authStorage = localStorage.getItem('mawjood-auth-storage');
        if (authStorage) {
          const { state } = JSON.parse(authStorage);
          const token = state?.token;
          
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
      } catch (error) {
        console.error('Error reading token from storage:', error);
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (typeof window !== 'undefined') {
        // Clear auth data from Zustand persist storage
        localStorage.removeItem('mawjood-auth-storage');

        // Import store dynamically to avoid circular dependency
        const { useAuthStore } = await import('@/store/authStore');
        useAuthStore.getState().logout();

        // Redirect to login
        window.location.href = '/';
      }
    }

    // Handle other errors
    return Promise.reject(error);
  }
);

export default axiosInstance;