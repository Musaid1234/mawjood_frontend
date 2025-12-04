import { API_BASE_URL, API_ENDPOINTS } from '@/config/api.config';
import axiosInstance from '@/lib/axios';
import { AxiosError } from 'axios';

export interface Advertisement {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl?: string | null;
  openInNewTab?: boolean;
  isActive: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  notes?: string | null;
  countryId?: string | null;
  regionId?: string | null;
  cityId?: string | null;
  categoryId?: string | null;
  adType?: 'CATEGORY' | 'TOP' | 'FOOTER' | 'BUSINESS_LISTING' | 'BLOG_LISTING' | 'HOMEPAGE';
  createdAt: string;
  updatedAt: string;
}

export interface AdvertisementQuery {
  locationId?: string;
  locationType?: 'city' | 'region' | 'country';
  categoryId?: string;
  adType?: 'CATEGORY' | 'TOP' | 'FOOTER' | 'BUSINESS_LISTING' | 'BLOG_LISTING' | 'HOMEPAGE';
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
      adType: query.adType,
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

  async getDisplayAdvertisements(query: AdvertisementQuery, limit: number = 5): Promise<Advertisement[]> {
    const ads: Advertisement[] = [];
    const seenIds = new Set<string>();

    // Try to fetch multiple ads by calling the display endpoint multiple times
    // The API should return different ads on each call if multiple are available
    for (let i = 0; i < limit; i++) {
      try {
        const ad = await this.getDisplayAdvertisement({
          ...query,
          adType: query.adType, // Ensure adType is passed through
        });
        if (ad && !seenIds.has(ad.id)) {
          ads.push(ad);
          seenIds.add(ad.id);
        } else if (!ad) {
          // If no ad is returned, break to avoid unnecessary calls
          break;
        }
      } catch {
        // If we can't fetch more, break
        break;
      }
    }

    return ads;
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

  async getAdvertisementById(id: string): Promise<Advertisement> {
    try {
      const response = await axiosInstance.get<ApiResponse<Advertisement>>(
        `${API_ENDPOINTS.ADVERTISEMENTS.BASE}/${id}`
      );
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  async getAllAdvertisements(params?: {
    page?: number;
    limit?: number;
    search?: string;
    adType?: string;
    isActive?: string;
  }): Promise<{
    advertisements: Advertisement[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.set('page', params.page.toString());
      if (params?.limit) queryParams.set('limit', params.limit.toString());
      if (params?.search) queryParams.set('search', params.search);
      if (params?.adType && params.adType !== 'all') queryParams.set('adType', params.adType);
      if (params?.isActive && params.isActive !== 'all') queryParams.set('isActive', params.isActive);

      const response = await axiosInstance.get<ApiResponse<{
        advertisements: Advertisement[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      }>>(`${API_ENDPOINTS.ADVERTISEMENTS.BASE}?${queryParams.toString()}`);
      
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  async updateAdvertisement(id: string, formData: FormData): Promise<Advertisement> {
    try {
      const response = await axiosInstance.patch<ApiResponse<Advertisement>>(
        `${API_ENDPOINTS.ADVERTISEMENTS.BASE}/${id}`,
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

  async deleteAdvertisement(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`${API_ENDPOINTS.ADVERTISEMENTS.BASE}/${id}`);
    } catch (error) {
      return handleError(error);
    }
  },

  async toggleAdvertisementStatus(id: string, isActive: boolean): Promise<Advertisement> {
    try {
      const formData = new FormData();
      formData.append('isActive', String(isActive));
      
      const response = await axiosInstance.patch<ApiResponse<Advertisement>>(
        `${API_ENDPOINTS.ADVERTISEMENTS.BASE}/${id}`,
        formData
      );
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },
};
