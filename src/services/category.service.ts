import axiosInstance from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api.config';
import { AxiosError } from 'axios';

// Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  image: string | null;
  order: number;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  subcategories: Category[];
  _count?: {
    subcategories: number;
    businesses: number;
  };
}

export interface CategoryResponse {
  success: boolean;
  message: string;
  data: {
    categories: Category[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface SingleCategoryResponse {
  success: boolean;
  message: string;
  data: Category;
}

// Error handler
const handleError = (error: unknown): never => {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    throw new Error(message);
  }
  throw error;
};

// Category Service
export const categoryService = {
  /**
   * Fetch all categories
   */
  async fetchCategories(page: number = 1, limit: number = 20): Promise<CategoryResponse> {
    try {
      const response = await axiosInstance.get<CategoryResponse>(
        `${API_ENDPOINTS.CATEGORIES.GET_ALL}?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Fetch category by ID
   */
  async fetchCategoryById(id: string): Promise<SingleCategoryResponse> {
    try {
      const response = await axiosInstance.get<SingleCategoryResponse>(
        API_ENDPOINTS.CATEGORIES.GET_BY_ID(id)
      );
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Fetch category by slug
   */
  async fetchCategoryBySlug(slug: string): Promise<SingleCategoryResponse> {
    try {
      const response = await axiosInstance.get<SingleCategoryResponse>(
        API_ENDPOINTS.CATEGORIES.GET_BY_SLUG(slug)
      );
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Create category (Admin only)
   */
  async createCategory(formData: FormData): Promise<SingleCategoryResponse> {
    try {
      const response = await axiosInstance.post<SingleCategoryResponse>(
        API_ENDPOINTS.CATEGORIES.CREATE,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Update category (Admin only)
   */
  async updateCategory(id: string, formData: FormData): Promise<SingleCategoryResponse> {
    try {
      const response = await axiosInstance.put<SingleCategoryResponse>(
        API_ENDPOINTS.CATEGORIES.UPDATE(id),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Delete category (Admin only)
   */
  async deleteCategory(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axiosInstance.delete(API_ENDPOINTS.CATEGORIES.DELETE(id));
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },
};