import axiosInstance from '@/lib/axios';
import { AxiosError } from 'axios';
import { API_ENDPOINTS } from '@/config/api.config';

export interface BlogAuthor {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string | null;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  blogCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Blog {
  id: string;
  slug: string;
  title: string;
  content: string;
  image?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  // For backward compatibility, tags may be an array of strings or an object containing metadata
  tags?: string[] | {
    tags?: string[];
    status?: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED';
    scheduledAt?: string;
    [key: string]: any;
  } | null;
  published?: boolean;
  status?: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED';
  scheduledAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  author: BlogAuthor;
  categories?: BlogCategory[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Error handler
const handleError = (error: unknown): never => {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    throw new Error(message);
  }
  throw error;
};

export const blogService = {
  // Public: Get published blogs
  async getBlogs(params?: {
    limit?: number;
    page?: number;
    search?: string;
    categorySlug?: string;
    categoryId?: string;
  }): Promise<Blog[]> {
    try {
      const { limit = 3, page = 1, ...filters } = params ?? {};
      const response = await axiosInstance.get<ApiResponse<{
        blogs: Blog[];
        pagination: any;
      }>>(API_ENDPOINTS.BLOGS.GET_ALL, {
        params: { limit, page, ...filters },
      });
      return response.data.data.blogs || [];
    } catch (error) {
      return handleError(error);
    }
  },

  // Public: Get blogs with pagination
  async getBlogsWithPagination(params?: {
    limit?: number;
    page?: number;
    search?: string;
    categorySlug?: string;
    categoryId?: string;
  }): Promise<{
    blogs: Blog[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    try {
      const { limit = 10, page = 1, ...filters } = params ?? {};
      const response = await axiosInstance.get<ApiResponse<{
        blogs: Blog[];
        pagination: any;
      }>>(API_ENDPOINTS.BLOGS.GET_ALL, {
        params: { limit, page, ...filters },
      });
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // Public: Get blog by slug
  async getBySlug(slug: string): Promise<Blog> {
    try {
      const response = await axiosInstance.get<ApiResponse<Blog>>(API_ENDPOINTS.BLOGS.GET_BY_SLUG(slug));
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // Admin: Get blog by slug (includes unpublished, draft, and scheduled blogs)
  async getBySlugAdmin(slug: string): Promise<Blog> {
    try {
      const response = await axiosInstance.get<ApiResponse<Blog>>(`/api/blogs/admin/slug/${slug}`);
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // Admin: Get all blogs (including unpublished)
  async getAllBlogsAdmin(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<{
    blogs: Blog[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>> {
    try {
      const response = await axiosInstance.get('/api/blogs/admin/all', { params });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // Admin: Get blog by ID
  async getBlogById(id: string): Promise<Blog> {
    try {
      const response = await axiosInstance.get<ApiResponse<Blog>>(API_ENDPOINTS.BLOGS.GET_BY_ID(id));
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // Admin: Create blog
  async createBlog(blogData: FormData): Promise<Blog> {
    try {
      const response = await axiosInstance.post<ApiResponse<Blog>>(API_ENDPOINTS.BLOGS.CREATE, blogData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // Admin: Update blog
  async updateBlog(id: string, blogData: FormData): Promise<Blog> {
    try {
      const response = await axiosInstance.put<ApiResponse<Blog>>(API_ENDPOINTS.BLOGS.UPDATE(id), blogData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // Admin: Delete blog
  async deleteBlog(id: string): Promise<void> {
    try {
      await axiosInstance.delete(API_ENDPOINTS.BLOGS.DELETE(id));
    } catch (error) {
      return handleError(error);
    }
  },

  async getCategories(): Promise<BlogCategory[]> {
    try {
      const response = await axiosInstance.get<ApiResponse<{
        categories: (BlogCategory & { blogCount?: number })[];
      }>>(API_ENDPOINTS.BLOG_CATEGORIES.GET_ALL);
      return response.data.data.categories || [];
    } catch (error) {
      return handleError(error);
    }
  },

  async getCategoryBySlug(slug: string): Promise<BlogCategory> {
    try {
      const response = await axiosInstance.get<ApiResponse<BlogCategory>>(
        API_ENDPOINTS.BLOG_CATEGORIES.GET_BY_SLUG(slug)
      );
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  async createCategory(payload: { name: string; slug?: string; description?: string }): Promise<BlogCategory> {
    try {
      const response = await axiosInstance.post<ApiResponse<BlogCategory>>(
        API_ENDPOINTS.BLOG_CATEGORIES.CREATE,
        payload
      );
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  async updateCategory(
    id: string,
    payload: { name?: string; slug?: string; description?: string }
  ): Promise<BlogCategory> {
    try {
      const response = await axiosInstance.patch<ApiResponse<BlogCategory>>(
        API_ENDPOINTS.BLOG_CATEGORIES.UPDATE(id),
        payload
      );
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  async deleteCategory(id: string): Promise<void> {
    try {
      await axiosInstance.delete(API_ENDPOINTS.BLOG_CATEGORIES.DELETE(id));
    } catch (error) {
      return handleError(error);
    }
  },
};

