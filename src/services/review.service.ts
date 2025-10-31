import axiosInstance from "@/lib/axios";

export interface Review {
  id: string;
  rating: number;
  comment: string;
  userId: string;
  businessId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string | null;
  };
  business?: {
    id: string;
    name: string;
    slug: string;
    logo?: string | null;
  };
}

export interface CreateReviewDTO {
  rating: number;
  comment: string;
  businessId: string;
}

export interface ReviewsResponse {
  success: boolean;
  message: string;
  data: Review[];
}

export interface CreateReviewResponse {
  success: boolean;
  message: string;
  data: Review;
}

export const reviewService = {
  async getMyReviews(): Promise<Review[]> {
    try {
      const response = await axiosInstance.get<ReviewsResponse>('api/businesses/my/reviews');
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch reviews');
    } catch (error) {
      console.error('Error fetching my reviews:', error);
      throw error;
    }
  },

  async createReview(data: CreateReviewDTO): Promise<Review> {
    try {
      const response = await axiosInstance.post<CreateReviewResponse>('api/reviews', data);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to create review');
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  },

  async updateReview(reviewId: string, data: Partial<CreateReviewDTO>): Promise<Review> {
    try {
      const response = await axiosInstance.put<CreateReviewResponse>(`api/reviews/${reviewId}`, data);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to update review');
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  },

  async deleteReview(reviewId: string): Promise<void> {
    try {
      const response = await axiosInstance.delete(`api/reviews/${reviewId}`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  },
};