import { API_BASE_URL, API_ENDPOINTS } from '@/config/api.config';

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

const buildUrlWithParams = (baseUrl: string, params?: Record<string, string | undefined>) => {
  const url = new URL(baseUrl);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value && value.length > 0) {
        url.searchParams.set(key, value);
      }
    });
  }
  return url.toString();
};

export const advertisementService = {
  async getDisplayAdvertisement(query: AdvertisementQuery): Promise<Advertisement | null> {
    if (!API_BASE_URL) {
      throw new Error('NEXT_PUBLIC_API_BASE_URL is not defined');
    }

    const url = buildUrlWithParams(
      `${API_BASE_URL}${API_ENDPOINTS.ADVERTISEMENTS.DISPLAY}`,
      {
        locationId: query.locationId,
        locationType: query.locationType,
        categoryId: query.categoryId,
      }
    );

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
};
