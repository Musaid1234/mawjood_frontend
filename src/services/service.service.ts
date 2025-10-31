import axiosInstance from '@/lib/axios';
import { AxiosError } from 'axios';

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  businessId: string;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessWithServices {
  id: string;
  name: string;
  slug: string;
  logo: string;
  services: Service[];
}

export interface ServicesResponse {
  success: boolean;
  message: string;
  data: BusinessWithServices[];
}

export interface CreateServiceData {
  name: string;
  description?: string;
  price: number;
  duration?: number;
}

const handleError = (error: unknown): never => {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    throw new Error(message);
  }
  throw error;
};

export const serviceService = {
  async getMyServices(): Promise<BusinessWithServices[]> {
    try {
      const response = await axiosInstance.get<ServicesResponse>('api/businesses/my/services');
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  async createService(businessId: string, data: CreateServiceData): Promise<Service> {
    try {
      const response = await axiosInstance.post(`api/businesses/${businessId}/services`, data);
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  async deleteService(serviceId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axiosInstance.delete(`api/businesses/services/${serviceId}`);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },
};