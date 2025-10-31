'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '@/services/review.service';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Trash2, AlertCircle, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export default function ReviewsPage() {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: reviews, isLoading, error } = useQuery({
    queryKey: ['my-reviews'],
    queryFn: () => reviewService.getMyReviews(),
  });

  const deleteMutation = useMutation({
    mutationFn: (reviewId: string) => reviewService.deleteReview(reviewId),
    onMutate: (reviewId) => {
      setDeletingId(reviewId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-reviews'] });
      setDeletingId(null);
      toast.success('Review deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete review:', error);
      setDeletingId(null);
      toast.error('Failed to delete review. Please try again.');
    },
  });

  const handleDelete = (reviewId: string) => {
    toast('Are you sure you want to delete this review?', {
      action: {
        label: 'Delete',
        onClick: () => deleteMutation.mutate(reviewId),
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-600">Loading your reviews...</p>
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
          Failed to load reviews
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

  if (!reviews || reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="bg-primary/10 rounded-full p-6 mb-4">
          <MessageSquare className="w-12 h-12 text-primary" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          No reviews yet
        </h3>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          Start sharing your experiences by reviewing businesses you've visited.
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
      {/* Header */}
      <div className="my-5">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">My Reviews</h1>
        <p className="text-gray-600 text-sm">
          You have written {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
        </p>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {reviews.map((review) => {
          const isDeleting = deletingId === review.id;
          const business = review.business;

          return (
            <div
              key={review.id}
              className={`bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow ${
                isDeleting ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              {/* Business Logo */}
              {business && (
                <Link href={`/businesses/${business.slug}`}>
                  <div className="relative w-full h-32 bg-gray-100">
                    {business.logo ? (
                      <Image
                        src={business.logo}
                        alt={business.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <MessageSquare className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                </Link>
              )}

              {/* Review Content */}
              <div className="p-4">
                {/* Business Name */}
                {business && (
                  <Link
                    href={`/businesses/${business.slug}`}
                    className="text-base font-semibold text-gray-900 hover:text-primary transition-colors mb-2 block line-clamp-1"
                  >
                    {business.name}
                  </Link>
                )}

                {/* Rating */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, index) => (
                      <Star
                        key={index}
                        className={`w-3.5 h-3.5 ${
                          index < review.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(review.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>

                {/* Comment */}
                {review.comment && (
                  <p className="text-gray-700 leading-relaxed text-sm mb-3 line-clamp-3">
                    {review.comment}
                  </p>
                )}

                {/* Actions */}
                <div className="pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleDelete(review.id)}
                    disabled={isDeleting}
                    className="flex items-center gap-1.5 px-3 py-3 text-xs font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors w-full justify-center"
                  >
                    {isDeleting ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-red-500 border-t-transparent"></div>
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    Delete Review
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}