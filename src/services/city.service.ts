import axiosInstance from '@/lib/axios';
import { AxiosError } from 'axios';

export interface Country {
  id: string;
  name: string;
  slug: string;
  code?: string | null;
  regions?: Region[];
}

export interface Region {
  id: string;
  name: string;
  slug: string;
  countryId: string;
  country?: Country;
  cities?: City[];
}

export interface City {
  id: string;
  name: string;
  slug: string;
  regionId: string;
  region?: Region;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface UnifiedLocationSearchResult {
  countries: Country[];
  regions: Region[];
  cities: City[];
}

const handleError = (error: unknown): never => {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    throw new Error(message);
  }
  throw error;
};

export const cityService = {
  async fetchCities(): Promise<City[]> {
    try {
      const response = await axiosInstance.get<ApiResponse<City[]>>('/api/cities');
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  async fetchCountries(): Promise<Country[]> {
    try {
      const response = await axiosInstance.get<ApiResponse<Country[]>>('/api/cities/countries');
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  async createCountry(countryData: { name: string; slug: string; code?: string }): Promise<Country> {
    try {
      const response = await axiosInstance.post<ApiResponse<Country>>('/api/cities/countries', countryData);
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  async updateCountry(id: string, countryData: { name: string; slug: string; code?: string }): Promise<Country> {
    try {
      const response = await axiosInstance.put<ApiResponse<Country>>(`/api/cities/countries/${id}`, countryData);
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  async deleteCountry(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`/api/cities/countries/${id}`);
    } catch (error) {
      return handleError(error);
    }
  },

  async unifiedSearch(query?: string): Promise<UnifiedLocationSearchResult> {
    try {
      const endpoint = query && query.trim().length > 0
        ? `/api/cities/search/unified?query=${encodeURIComponent(query)}`
        : '/api/cities/search/unified';

      const response = await axiosInstance.get<ApiResponse<UnifiedLocationSearchResult>>(endpoint);
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  async fetchCityBySlug(slug: string): Promise<City | null> {
    try {
      const response = await axiosInstance.get<ApiResponse<City>>(`/api/cities/slug/${slug}`);
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  async createCity(cityData: { name: string; slug: string; regionId: string }): Promise<City> {
    try {
      const response = await axiosInstance.post<ApiResponse<City>>('/api/cities', cityData);
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  async updateCity(id: string, cityData: { name: string; slug: string; regionId: string }): Promise<City> {
    try {
      const response = await axiosInstance.put<ApiResponse<City>>(`/api/cities/${id}`, cityData);
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  async deleteCity(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`/api/cities/${id}`);
    } catch (error) {
      return handleError(error);
    }
  },

  async fetchRegions(): Promise<Region[]> {
    try {
      const response = await axiosInstance.get<ApiResponse<Region[]>>('/api/cities/regions');
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  async createRegion(regionData: { name: string; slug: string; countryId: string }): Promise<Region> {
    try {
      const response = await axiosInstance.post<ApiResponse<Region>>('/api/cities/regions', regionData);
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  async updateRegion(id: string, regionData: { name: string; slug: string; countryId: string }): Promise<Region> {
    try {
      const response = await axiosInstance.put<ApiResponse<Region>>(`/api/cities/regions/${id}`, regionData);
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  async deleteRegion(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`/api/cities/regions/${id}`);
    } catch (error) {
      return handleError(error);
    }
  },
};