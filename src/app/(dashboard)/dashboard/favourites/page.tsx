'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, MapPin, Star, Building2, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function FavouritesPage() {
  const queryClient = useQueryClient();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const { data: favourites, isLoading, error } = useQuery({
    queryKey: ['favourites'],
    queryFn: () => userService.getFavourites(),
  });

  const removeMutation = useMutation({
    mutationFn: (businessId: string) => userService.removeFavourite(businessId),
    onMutate: (businessId) => {
      setRemovingId(businessId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favourites'] });
      setRemovingId(null);
      toast.success('Removed from favourites');
    },
    onError: (error) => {
      console.error('Failed to remove favourite:', error);
      setRemovingId(null);
      toast.error('Failed to remove from favourites. Please try again.');
    },
  });

  const handleRemove = (businessId: string, businessName: string) => {
    toast(`Remove "${businessName}"?`, {
      action: {
        label: 'Remove',
        onClick: () => removeMutation.mutate(businessId),
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-600">Loading your favourites...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="bg-red-50 rounded-full p-4 mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Failed to load favourites
        </h3>
        <p className="text-gray-600 mb-4">
          {error instanceof Error ? error.message : 'Something went wrong'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!favourites || favourites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="bg-red-50 rounded-full p-6 mb-4">
          <Heart className="w-12 h-12 text-red-500" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          No favourites yet
        </h3>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          Start exploring and save your favourite businesses for quick access later.
        </p>
        <Link
          href="/businesses"
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          Explore Businesses
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Simple Header */}
      <div className="my-5">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">My Favourites</h1>
        <p className="text-gray-600 text-sm">
          {favourites.length} {favourites.length === 1 ? 'saved business' : 'saved businesses'}
        </p>
      </div>

      {/* Favourites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {favourites.map((favourite) => {
          const business = favourite.business;
          const isRemoving = removingId === business.id;

          return (
            <div
              key={favourite.id}
              className={`bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow ${
                isRemoving ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              {/* Image Section */}
              <div className="relative h-48 bg-gray-100">
                <Link href={`/businesses/${business.slug}`} className="block h-full">
                  {business.coverImage || business.logo ? (
                    <Image
                      src={business.coverImage || business.logo || ''}
                      alt={business.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Building2 className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </Link>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemove(business.id, business.name)}
                  disabled={isRemoving}
                  className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                  title="Remove from favourites"
                >
                  {isRemoving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-500 border-t-transparent"></div>
                  ) : (
                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                  )}
                </button>

                {/* Verified Badge */}
                {business.isVerified && (
                  <div className="absolute top-3 left-3">
                    <span className="bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                      Verified
                    </span>
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="p-4">
                {/* Business Name */}
                <Link href={`/businesses/${business.slug}`}>
                  <h3 className="text-lg font-semibold text-gray-900 hover:text-primary transition-colors line-clamp-1 mb-2">
                    {business.name}
                  </h3>
                </Link>

                {/* Address */}
                <div className="flex items-start gap-1.5 text-gray-600 mb-3">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 text-gray-400 flex-shrink-0" />
                  <p className="text-sm line-clamp-1">{business.address}</p>
                </div>

                {/* Rating */}
                {business.totalReviews > 0 ? (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, index) => (
                        <Star
                          key={index}
                          className={`w-3.5 h-3.5 ${
                            index < Math.floor(business.averageRating)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-600">
                      {business.averageRating.toFixed(1)} ({business.totalReviews})
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 mb-3 text-gray-400">
                    <Star className="w-3.5 h-3.5" />
                    <span className="text-xs">No reviews yet</span>
                  </div>
                )}

                {/* Category */}
                <div className="pt-2 border-t border-gray-100">
                  <span className="inline-block bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full">
                    {business.category.name}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}