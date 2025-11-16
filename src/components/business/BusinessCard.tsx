import Link from 'next/link';
import Image from 'next/image';
import { Heart, Phone, MapPin, Star, Sparkles } from 'lucide-react';
import { Business } from '@/services/business.service';
import { useFavorites } from '@/hooks/useFavorites';

interface BusinessCardProps {
  business: Business;
  onToggleFavorite?: (id: string) => void;
  isFavorite?: boolean;
}

export default function BusinessCard({ business, onToggleFavorite }: BusinessCardProps) {
  const isOpen = business.status === 'ACTIVE';
  const priceLevel = business.averageRating >= 4.5 ? '$$$' : business.averageRating >= 3.5 ? '$$' : '$';
  const { isFavorite, toggleFavorite, isLoading } = useFavorites();
  const descriptionText = business.description
    ? business.description.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
    : '';

  // Check if business has active subscription (top placement)
  const hasActiveSubscription = business.promotedUntil && new Date(business.promotedUntil) > new Date();

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 ${hasActiveSubscription ? 'ring-2 ring-purple-500 ring-opacity-50' : ''}`}>
      <div className="relative h-64 group">
        <Link href={`/businesses/${business.slug}`}>
          <Image
            src={business.coverImage || business.logo || '/placeholder-business.jpg'}
            alt={business.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </Link>

        {/* Top Left Badges */}
        <div className="absolute top-3 left-3 flex gap-2 z-10">
          {hasActiveSubscription && (
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
              <Sparkles className="w-3 h-3" />
              FEATURED
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(business.id);
          }}
          disabled={isLoading}
          className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          aria-label="Add to favorites"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
          ) : (
            <Heart className={`w-5 h-5 ${isFavorite(business.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
          )}
        </button>

        {/* {business.user && (
          <div className="absolute bottom-3 left-3">
            <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-gray-200">
              {business.user.avatar ? (
                <Image
                  src={business.user.avatar}
                  alt={`${business.user.firstName} ${business.user.lastName}`}
                  width={48}
                  height={48}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary text-white font-semibold text-sm">
                  {business.user.firstName?.[0]}{business.user.lastName?.[0]}
                </div>
              )}
            </div>
          </div>
        )} */}
      </div>

      {/* Content */}
      <div className="p-4">
        <Link href={`/businesses/${business.slug}`}>
          <h3 className="font-semibold text-lg text-gray-900 mb-2 hover:text-primary transition-colors flex items-center gap-2">
            {business.name}
            {business.isVerified && (
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </h3>
        </Link>

        {descriptionText && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {descriptionText}
          </p>
        )}

        {/* Contact & Location */}
        <div className="space-y-2 mb-3">
          {business.phone && (
            <a
              href={`tel:${business.phone}`}
              className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Phone className="w-4 h-4" />
              <span className="truncate">{business.phone}</span>
            </a>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{business.city.name}</span>
          </div>
        </div>

        {/* Footer - Category & Rating */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded flex items-center justify-center">
              <span className="text-lg">🏷️</span>
            </div>
            <span className="text-sm font-medium text-gray-700">
              {business.category.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-yellow-300 text-white px-2 py-1 rounded text-xs font-semibold">
              <span>{business.averageRating > 0 ? business.averageRating.toFixed(1) : '5.0'}</span>
              <Star className="w-3 h-3 fill-current" />
            </div>
            <span className="text-xs text-gray-600 whitespace-nowrap">
              {business.totalReviews || 0} Reviews
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}