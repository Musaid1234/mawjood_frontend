import axiosInstance from '@/lib/axios';
import { AxiosError } from 'axios';

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  duration?: number;
  image?: string;
  youtubeUrl?: string;
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
  currency?: string;
  duration?: number;
  image?: File;
  youtubeUrl?: string;
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
      const formData = new FormData();
      
      formData.append('name', data.name);
      formData.append('price', data.price.toString());
      
      if (data.description) {
        formData.append('description', data.description);
      }
      if (data.currency) {
        formData.append('currency', data.currency);
      }
      if (data.duration) {
        formData.append('duration', data.duration.toString());
      }
      if (data.youtubeUrl) {
        formData.append('youtubeUrl', data.youtubeUrl);
      }
      if (data.image) {
        formData.append('image', data.image);
      }
      
      const response = await axiosInstance.post(`api/businesses/${businessId}/services`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  async updateService(serviceId: string, data: CreateServiceData): Promise<Service> {
    try {
      const formData = new FormData();
      
      formData.append('name', data.name);
      formData.append('price', data.price.toString());
      
      if (data.description) {
        formData.append('description', data.description);
      }
      if (data.currency) {
        formData.append('currency', data.currency);
      }
      if (data.duration) {
        formData.append('duration', data.duration.toString());
      }
      if (data.youtubeUrl) {
        formData.append('youtubeUrl', data.youtubeUrl);
      }
      if (data.image) {
        formData.append('image', data.image);
      }
      
      const response = await axiosInstance.put(`api/businesses/services/${serviceId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
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