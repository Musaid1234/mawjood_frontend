import Link from 'next/link';
import Image from 'next/image';
import { Heart, Phone, MapPin, Star } from 'lucide-react';
import { Business } from '@/services/business.service';
import { useState } from 'react';

interface BusinessListCardProps {
  business: Business;
  onToggleFavorite?: (id: string) => void;
  isFavorite?: boolean;
}

export default function BusinessListCard({ business, onToggleFavorite, isFavorite }: BusinessListCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const allImages = [
    business.logo,
    business.coverImage,
    ...(business.images || [])
  ].filter(Boolean) as string[];

  const hasMultipleImages = allImages.length > 1;
  const isOpen = business.status === 'ACTIVE';
  const priceLevel = business.averageRating >= 4.5 ? '$$$' : business.averageRating >= 3.5 ? '$$' : '$';

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row">
        {/* Left: Image Section */}
        <div className="relative w-full md:w-80 h-64 bg-gray-100 flex-shrink-0">
          {allImages.length > 0 ? (
            <>
              <Link href={`/businesses/${business.slug}`}>
                <Image
                  src={allImages[currentImageIndex]}
                  alt={business.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 320px"
                />
              </Link>

              {/* Top Left Badges */}
              <div className="absolute top-3 left-3 flex gap-2 z-10">
                <span className={`text-white text-xs font-bold px-3 py-1 rounded ${
                  isOpen ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {isOpen ? 'OPEN' : 'CLOSED'}
                </span>
              </div>

              {/* Navigation Arrows */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors z-10"
                    aria-label="Previous image"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors z-10"
                    aria-label="Next image"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Owner Avatar */}
              {business.user && (
                <div className="absolute bottom-3 left-3 z-10">
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
              )}
            </>
          ) : (
            <Link href={`/businesses/${business.slug}`}>
              <div className="w-full h-full flex items-center justify-center text-6xl">
                🏢
              </div>
            </Link>
          )}

          {/* Favorite Button */}
          <button
            onClick={() => onToggleFavorite?.(business.id)}
            className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors z-10"
            aria-label="Add to favorites"
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
              }`}
            />
          </button>
        </div>

        {/* Right: Business Info */}
        <div className="flex-1 p-5">
          <Link href={`/businesses/${business.slug}`}>
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className="text-xl font-bold text-gray-900 hover:text-primary transition-colors flex items-center gap-2">
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
            </div>

            {/* Category */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-gray-600">{business.category.name}</span>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {business.description}
            </p>

            {/* Rating & Reviews */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              {business.averageRating > 0 && (
                <div className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded font-semibold text-sm">
                  <span>{business.averageRating.toFixed(1)}</span>
                  <Star className="w-4 h-4 fill-current" />
                </div>
              )}
              <span className="text-sm text-gray-600">{business.totalReviews || 0} Reviews</span>
              
              {/* Badges */}
              <div className="flex items-center gap-2">
                <span className="bg-yellow-100 border border-yellow-300 text-yellow-800 text-xs font-semibold px-2 py-1 rounded">
                  🛡️ Trust
                </span>
                {business.isVerified && (
                  <span className="bg-blue-100 border border-blue-300 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                    ✓ Verified
                  </span>
                )}
                <span className="bg-orange-100 border border-orange-300 text-orange-800 text-xs font-semibold px-2 py-1 rounded">
                  🔥 Responsive
                </span>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-2 mb-4 text-gray-700">
              <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{business.address || business.city.name}</span>
            </div>
          </Link>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            {business.phone && (
              <a
                href={`tel:${business.phone}`}
                onClick={(e) => e.stopPropagation()}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2.5 rounded flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-5 h-5" />
                {business.phone}
              </a>
            )}
            
            {business.whatsapp && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(`https://wa.me/${business.whatsapp}`, '_blank');
                }}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2.5 rounded flex items-center justify-center gap-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                </svg>
                WhatsApp
              </button>
            )}
            
            <Link
              href={`/businesses/${business.slug}`}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded flex items-center justify-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              Get Best Deal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}