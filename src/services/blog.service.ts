import { API_BASE_URL, API_ENDPOINTS } from '@/config/api.config';

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
  createdAt: string;
  author: BlogAuthor;
}

export interface BlogListResponse {
  success: boolean;
  message: string;
  data: {
    blogs: Blog[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export const blogService = {
  async getBlogs(limit: number = 3, page: number = 1): Promise<Blog[]> {
    const params = new URLSearchParams();
    params.set('limit', String(Math.min(limit, 3))); // cap at 3
    params.set('page', String(page));

    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.BLOGS.GET_ALL}?${params.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch blogs: ${res.status}`);
    }

    const json: BlogListResponse = await res.json();
    if (!json.success) {
      throw new Error(json.message || 'Failed to fetch blogs');
    }

    // Always return max 3
    return (json.data.blogs || []).slice(0, 3);
  },

  async getBySlug(slug: string): Promise<Blog> {
    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.BLOGS.GET_BY_SLUG(slug)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch blog: ${res.status}`);
    }

    const json = await res.json();
    if (!json.success) {
      throw new Error(json.message || 'Failed to fetch blog');
    }

    return json.data as Blog;
  },
};