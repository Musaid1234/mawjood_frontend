import axiosInstance from "@/lib/axios";
import { Business } from "./business.service";

export interface Favourite {
  id: string;
  userId: string;
  businessId: string;
  createdAt: string;
  business: Business;
}

export interface FavouritesResponse {
  success: boolean;
  message: string;
  data: Favourite[];
}

export const userService = {
  async getFavourites(): Promise<Favourite[]> {
    try {
      const response = await axiosInstance.get<FavouritesResponse>('api/users/favourites');
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch favourites');
    } catch (error) {
      console.error('Error fetching favourites:', error);
      throw error;
    }
  },

  async addFavourite(businessId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axiosInstance.post('api/users/favourites', { businessId });
      return response.data;
    } catch (error) {
      console.error('Error adding favourite:', error);
      throw error;
    }
  },

  async removeFavourite(businessId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axiosInstance.delete(`api/users/favourites/${businessId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing favourite:', error);
      throw error;
    }
  },
};

