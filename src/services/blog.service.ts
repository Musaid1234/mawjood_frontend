import axiosInstance from '@/lib/axios';
import { AxiosError } from 'axios';

export interface BlogAuthor {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string | null;
}

export interface Blog {
  id: string;
  slug: string;
  title: string;
  content: string;
  image?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  tags?: string[] | null;
  published?: boolean;
  createdAt: string;
  updatedAt?: string;
  author: BlogAuthor;
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
  async getBlogs(limit: number = 3, page: number = 1): Promise<Blog[]> {
    try {
      const response = await axiosInstance.get<ApiResponse<{
        blogs: Blog[];
        pagination: any;
      }>>('/api/blogs', {
        params: { limit: Math.min(limit, 3), page },
      });
      return (response.data.data.blogs || []).slice(0, 3);
    } catch (error) {
      return handleError(error);
    }
  },

  // Public: Get blogs with pagination
  async getBlogsWithPagination(limit: number = 12, page: number = 1): Promise<{
    blogs: Blog[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    try {
      const response = await axiosInstance.get<ApiResponse<{
        blogs: Blog[];
        pagination: any;
      }>>('/api/blogs', {
        params: { limit, page },
      });
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // Public: Get blog by slug
  async getBySlug(slug: string): Promise<Blog> {
    try {
      const response = await axiosInstance.get<ApiResponse<Blog>>(`/api/blogs/slug/${slug}`);
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
      const response = await axiosInstance.get<ApiResponse<Blog>>(`/api/blogs/${id}`);
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // Admin: Create blog
  async createBlog(blogData: FormData): Promise<Blog> {
    try {
      const response = await axiosInstance.post<ApiResponse<Blog>>('/api/blogs', blogData, {
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
      const response = await axiosInstance.put<ApiResponse<Blog>>(`/api/blogs/${id}`, blogData, {
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
      await axiosInstance.delete(`/api/blogs/${id}`);
    } catch (error) {
      return handleError(error);
    }
  },
};

