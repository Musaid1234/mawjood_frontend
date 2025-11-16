import { API_BASE_URL, API_ENDPOINTS } from '@/config/api.config';
import axiosInstance from '@/lib/axios';
import { AxiosError } from 'axios';

export interface Advertisement {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl?: string | null;
  isActive: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  notes?: string | null;
  countryId?: string | null;
  regionId?: string | null;
  cityId?: string | null;
  categoryId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdvertisementQuery {
  locationId?: string;
  locationType?: 'city' | 'region' | 'country';
  categoryId?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const buildUrlWithParams = (basePath: string, params?: Record<string, string | undefined>) => {
  if (!API_BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not defined');
  }

  const url = new URL(basePath, API_BASE_URL);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value && value.length > 0) {
        url.searchParams.set(key, value);
      }
    });
  }
  return url.toString();
};

const handleError = (error: unknown): never => {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    throw new Error(message);
  }
  throw error;
};

export const advertisementService = {
  async getDisplayAdvertisement(query: AdvertisementQuery): Promise<Advertisement | null> {
    const url = buildUrlWithParams(API_ENDPOINTS.ADVERTISEMENTS.DISPLAY, {
      locationId: query.locationId,
      locationType: query.locationType,
      categoryId: query.categoryId,
    });

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch advertisement: ${response.status}`);
    }

    const payload: ApiResponse<Advertisement | null> = await response.json();
    if (!payload.success) {
      throw new Error(payload.message || 'Failed to fetch advertisement');
    }

    return payload.data ?? null;
  },

  async createAdvertisement(formData: FormData): Promise<Advertisement> {
    try {
      const response = await axiosInstance.post<ApiResponse<Advertisement>>(
        API_ENDPOINTS.ADVERTISEMENTS.BASE,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },
};
