// hooks/useFavorites.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { userService } from '@/services/user.service';
import { toast } from 'sonner';

export const useFavorites = () => {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  // Fetch favorites
  const { data: favoritesData } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => userService.getFavourites(),
    enabled: isAuthenticated,
  });

  // Create Set for O(1) lookup
  const favoriteIds = new Set(
    favoritesData?.map((fav: any) => fav.businessId) || []
  );

  // Add to favorites
  const addFavoriteMutation = useMutation({
    mutationFn: (businessId: string) => userService.addFavourite(businessId),
    onSuccess: (data) => {
      toast.success(data.message || 'Added to favorites');
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add to favorites');
    },
  });

  // Remove from favorites
  const removeFavoriteMutation = useMutation({
    mutationFn: (businessId: string) => userService.removeFavourite(businessId),
    onSuccess: (data) => {
      toast.success(data.message || 'Removed from favorites');
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove');
    },
  });

  // Toggle favorite
  const toggleFavorite = (businessId: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to add favorites');
      return;
    }

    if (favoriteIds.has(businessId)) {
      removeFavoriteMutation.mutate(businessId);
    } else {
      addFavoriteMutation.mutate(businessId);
    }
  };

  const isFavorite = (businessId: string) => favoriteIds.has(businessId);
  const isLoading = addFavoriteMutation.isPending || removeFavoriteMutation.isPending;

  return {
    favoriteIds,
    isFavorite,
    toggleFavorite,
    isLoading,
  };
};