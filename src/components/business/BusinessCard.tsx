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
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-56 group">
        <Link href={`/businesses/${business.slug}`}>
          <Image
            src={business.coverImage || business.logo || '/placeholder-business.jpg'}
            alt={business.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </Link>

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
            <h3 className="font-semibold text-lg text-gray-900 mb-2 hover:text-primary transition-colors flex items-center gap-2 flex-wrap">
            {business.name.charAt(0).toUpperCase() + business.name.slice(1)}
              {hasActiveSubscription && (
                <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700">
                  <Sparkles className="w-3.5 h-3.5" />
                  Featured
                </span>
              )}
          </h3>
        </Link>

        {descriptionText && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2 h-10">
            {descriptionText}
          </p>
        )}
        {!descriptionText && (
          <div className="h-10 mb-3"></div>
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
          <Link 
            href={`/${business.city.slug}/${business.category.slug}`}
            className="flex items-center gap-2 hover:text-primary transition-colors"
          >
            <div className="w-8 h-8 rounded flex items-center justify-center">
              <span className="text-lg">🏷️</span>
            </div>
            <span className="text-sm font-medium text-gray-700">
              {business.category.name}
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {business.totalReviews > 0 && business.averageRating > 0 && (
              <div className="flex items-center gap-1 bg-yellow-300 text-white px-2 py-1 rounded text-xs font-semibold">
                <span>{business.averageRating.toFixed(1)}</span>
                <Star className="w-3 h-3 fill-current" />
              </div>
            )}
            <span className="text-xs text-gray-600 whitespace-nowrap">
              {business.totalReviews || 0} Reviews
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}