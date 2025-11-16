import axiosInstance from "@/lib/axios";

export type LocationType = 'city' | 'region' | 'country';

export interface Business {
  crNumber: string;
  services: Service[];
  workingHours: WorkingHours | null | undefined;
  id: string;
  name: string;
  slug: string;
  description: string;
  email: string;
  phone: string;
  whatsapp?: string;
  website?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  logo?: string;
  coverImage?: string;
  images?: ImageObject[] | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  averageRating: number;
  totalReviews: number;
  isVerified: boolean;
  status: string;
  category: {
    id: string;
    name: string;
    slug: string;
    icon?: string;  // ✅ Added icon
  };
  city: {
    id: string;
    name: string;
    slug: string;
  };
  user?: {  // ✅ Added user
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  reviews?: Array<{
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      avatar?: string | null;
    };
  }>;
  distance?: number | null;
  viewCount?: number;
  keywords?: string[] | null;
  currentSubscriptionId?: string | null;
  subscriptionStartedAt?: string | null;
  subscriptionExpiresAt?: string | null;
  canCreateAdvertisements?: boolean;
  promotedUntil?: string | null;
}

export interface CreateBusinessData {
  name: string;
  slug: string;
  description?: string;
  email: string;
  phone: string;
  whatsapp?: string;
  website?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  categoryId: string;
  countryId?: string;
  regionId?: string;
  cityId: string;
  crNumber?: string;
  workingHours?: Record<string, { open: string; close: string; isClosed?: boolean }>;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  logo?: File;
  logoAlt?: string;
  coverImage?: File;
  coverImageAlt?: string;
  images?: File[];
  galleryImages?: Array<{ url: string; alt?: string }>;
  existingImages?: Array<string | { url: string; alt?: string }>;
}

export interface BusinessSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  categoryIds?: string[];
  locationId?: string;
  locationType?: LocationType;
  cityId?: string; // Deprecated: use locationId instead
  latitude?: number;
  longitude?: number;
  radius?: number;
  sortBy?: string;
  rating?: number;
}

export interface BusinessResponse {
  success: boolean;
  message: string;
  data: {
    businesses: Business[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    locationContext?: LocationContext;
  };
}

export interface LocationContext {
  requested: {
    id: string;
    type: LocationType;
    name: string;
  };
  applied: {
    id: string;
    type: LocationType;
    name: string;
  } | null;
  fallbackApplied: boolean;
}

// Add these interfaces after BusinessResponse
export interface SearchResult {
  type: 'category' | 'business';
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  logo?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  city?: {
    id: string;
    name: string;
    slug: string;
  };
  averageRating?: number;
  totalReviews?: number;
  isVerified?: boolean;
}

export interface UnifiedSearchResponse {
  categories: SearchResult[];
  businesses: SearchResult[];
  query: string;
}

export interface FeaturedBusinessParams {
  limit?: number;
  locationId?: string;
  locationType?: LocationType;
  cityId?: string; // Deprecated: use locationId instead
}

// Extended Business types for detail page
export interface Service {
  id: string;
  name: string;
  description?: string;
  price?: number;
  duration?: number;
  businessId: string;
}

export interface ImageObject {
  url: string;
  alt?: string;
}

export interface WorkingHours {
  [key: string]: {
    open: string;
    close: string;
    isClosed?: boolean;
  };
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  userName: string;
  userAvatar?: string;
  createdAt: string;
  images?: string[];
}

export interface ReviewsResponse {
  reviews: Review[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const businessService = {
  async searchBusinesses(params: BusinessSearchParams): Promise<BusinessResponse['data']> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.set('page', params.page.toString());
      if (params.limit) queryParams.set('limit', params.limit.toString());
      if (params.search) queryParams.set('search', params.search);
      if (params.categoryId) queryParams.set('categoryId', params.categoryId);
      if (params.categoryIds && params.categoryIds.length > 0) {
        queryParams.set('categoryIds', params.categoryIds.join(','));
      }
      const locationId = params.locationId ?? params.cityId;
      if (locationId) {
        queryParams.set('locationId', locationId);
      }
      if (params.locationType) {
        queryParams.set('locationType', params.locationType);
      }
      if (params.latitude) queryParams.set('latitude', params.latitude.toString());
      if (params.longitude) queryParams.set('longitude', params.longitude.toString());
      if (params.radius) queryParams.set('radius', params.radius.toString());
      if (params.sortBy) queryParams.set('sortBy', params.sortBy);
      if (typeof params.rating === 'number' && !Number.isNaN(params.rating)) {
        queryParams.set('rating', params.rating.toString());
      }

      const response = await fetch(`${API_BASE_URL}/api/businesses?${queryParams.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data: BusinessResponse = await response.json();
      if (!data.success) throw new Error(data.message || 'Failed to fetch businesses');

      return data.data;
    } catch (error) {
      console.error('Error searching businesses:', error);
      throw error;
    }
  },

  async getBusinessBySlug(slug: string): Promise<Business> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/businesses/slug/${slug}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'Failed to fetch business');

      return data.data;
    } catch (error) {
      console.error('Error fetching business:', error);
      throw error;
    }
  },

  async getBusinessById(id: string): Promise<Business> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/businesses/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'Failed to fetch business');

      return data.data;
    } catch (error) {
      console.error('Error fetching business:', error);
      throw error;
    }
  },

  async unifiedSearch(query: string, cityId?: string, limit: number = 10): Promise<UnifiedSearchResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.set('query', query);
      if (cityId) queryParams.set('cityId', cityId);
      queryParams.set('limit', limit.toString());

      const response = await fetch(`${API_BASE_URL}/api/businesses/search/unified?${queryParams.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'Failed to perform search');

      return data.data;
    } catch (error) {
      console.error('Error performing unified search:', error);
      throw error;
    }
  },

  async getFeaturedBusinesses(
    params?: FeaturedBusinessParams
  ): Promise<{ businesses: Business[]; locationContext?: LocationContext }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.limit) queryParams.set('limit', params.limit.toString());
      const locationId = params?.locationId ?? params?.cityId;
      if (locationId) {
        queryParams.set('locationId', locationId);
      }
      if (params?.locationType) {
        queryParams.set('locationType', params.locationType);
      }
  
      const response = await fetch(`${API_BASE_URL}/api/businesses/featured?${queryParams.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });
  
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'Failed to fetch featured businesses');
  
      if (Array.isArray(data.data)) {
        return { businesses: data.data };
      }

      return {
        businesses: data.data?.businesses ?? [],
        locationContext: data.data?.locationContext,
      };
    } catch (error) {
      console.error('Error fetching featured businesses:', error);
      throw error;
    }
  },

  async trackBusinessView(businessId: string): Promise<{ success: boolean }> {
    try {
      const response = await axiosInstance.post(`api/businesses/${businessId}/view`);
      return response.data;
    } catch (error) {
      console.error('Failed to track view:', error);
      return { success: false };
    }
  },

  async getMyBusinesses(): Promise<Business[]> {
    try {
      const response = await axiosInstance.get('api/businesses/my/businesses');
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch businesses');
    } catch (error) {
      console.error('Error fetching my businesses:', error);
      throw error;
    }
  }, 

  async createBusiness(data: CreateBusinessData): Promise<Business> {
    try {
      const formData = new FormData();
      
      // Append basic fields
      formData.append('name', data.name);
      formData.append('slug', data.slug);
      if (data.description) formData.append('description', data.description);
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      if (data.whatsapp) formData.append('whatsapp', data.whatsapp);
      if (data.website) formData.append('website', data.website);
      formData.append('address', data.address);
      if (data.latitude) formData.append('latitude', data.latitude.toString());
      if (data.longitude) formData.append('longitude', data.longitude.toString());
      formData.append('categoryId', data.categoryId);
      if (data.countryId) formData.append('countryId', data.countryId);
      if (data.regionId) formData.append('regionId', data.regionId);
      formData.append('cityId', data.cityId);
      if (data.crNumber) formData.append('crNumber', data.crNumber);
      
      // Append working hours
      if (data.workingHours) {
        formData.append('workingHours', JSON.stringify(data.workingHours));
      }
      
      // Append meta fields
      if (data.metaTitle) formData.append('metaTitle', data.metaTitle);
      if (data.metaDescription) formData.append('metaDescription', data.metaDescription);
      
      // Append keywords
      if (data.keywords && data.keywords.length > 0) {
        formData.append('keywords', JSON.stringify(data.keywords));
      }
      
      // Append alt tags
      if (data.logoAlt) formData.append('logoAlt', data.logoAlt);
      if (data.coverImageAlt) formData.append('coverImageAlt', data.coverImageAlt);
      
      // Append files
      if (data.logo) formData.append('logo', data.logo);
      if (data.coverImage) formData.append('coverImage', data.coverImage);
      
      // Collect alt tags for gallery images from galleryImages field
      const imageAlts: string[] = [];
      if ((data as any).galleryImages && Array.isArray((data as any).galleryImages)) {
        (data as any).galleryImages.forEach((img: any) => {
          imageAlts.push(img?.alt || '');
        });
      }
      
      // Append new image files
      if (data.images && data.images.length > 0) {
        data.images.forEach((image) => {
          formData.append('images', image);
        });
      }
      
      if (imageAlts.length > 0) {
        formData.append('imageAlts', JSON.stringify(imageAlts));
      }

      const response = await axiosInstance.post('api/businesses', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.data;
    } catch (error: any) {
      console.error('Error creating Business:', error);
      // Preserve the error response for better error handling
      if (error.response) {
        throw error;
      }
      throw new Error(error?.message || 'Failed to create business');
    }
  },

  async updateBusiness(id: string, data: Partial<CreateBusinessData>): Promise<Business> {
    try {
      const formData = new FormData();
      
      Object.entries(data).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        
        if (key === 'workingHours' || key === 'keywords') {
          formData.append(key, JSON.stringify(value));
        } else if (key === 'images' && Array.isArray(value)) {
          value.forEach((image) => {
            if (image instanceof File) {
              formData.append('images', image);
            }
          });
        } else if (key === 'galleryImages' && Array.isArray(value)) {
          // Extract alt tags from gallery images
          const imageAlts = value.map((img: any) => img?.alt || '');
          if (imageAlts.length > 0) {
            formData.append('imageAlts', JSON.stringify(imageAlts));
          }
        } else if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value.toString());
        }
      });

      const response = await axiosInstance.put(`api/businesses/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.data;
    } catch (error) {
      console.error('Error Updating Business:', error);
      throw error;
    }
  },

  async deleteBusiness(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`api/businesses/${id}`);
    } catch (error) {
      console.error('Error Deleting Business:', error);
      throw error;
    }
  },
};
