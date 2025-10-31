'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Business } from '@/services/business.service';

interface Props {
  business: Business;
}

export default function BusinessListingCard({ business }: Props) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Prepare images array (logo, coverImage, and other images)
  const allImages = [
    business.logo,
    business.coverImage,
    ...(business.images || [])
  ].filter(Boolean) as string[];

  const hasMultipleImages = allImages.length > 1;

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


  console.log('business listing : ',business);
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row">
        {/* Left: Image Carousel */}
        <div className="relative w-full md:w-72 h-56 md:h-64 bg-gray-100 flex-shrink-0">
          {allImages.length > 0 ? (
            <>
              <Link href={`/businesses/${business.slug}`}>
                <Image
                  src={allImages[currentImageIndex]}
                  alt={business.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 288px"
                />
              </Link>
              
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
            </>
          ) : (
            <Link href={`/businesses/${business.slug}`}>
              <div className="w-full h-full flex items-center justify-center text-6xl">
                🏢
              </div>
            </Link>
          )}
        </div>

        {/* Right: Business Info */}
        <div className="flex-1 p-4 md:p-5">
          <Link href={`/businesses/${business.slug}`}>
            {/* Header: Name, Rating, Category */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-start gap-2">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 hover:text-primary transition-colors">
                    {business.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-600">{business.category.name}</span>
                  </div>
                </div>
              </div>
              {business.averageRating > 0 && (
                <div className="text-right flex-shrink-0">
                  <div className="text-xl font-bold text-gray-900">
                    ₹ {Math.round(business.averageRating * 1000)}
                  </div>
                  <div className="text-xs text-gray-500">per night</div>
                </div>
              )}
            </div>

            {/* Rating & Badges */}
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              {business.averageRating > 0 && (
                <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded font-semibold text-sm">
                  <span>{business.averageRating.toFixed(1)}</span>
                  <span>★</span>
                </div>
              )}
              <span className="text-sm text-gray-600">{business.totalReviews} Ratings</span>
              
              <div className="flex items-center gap-2">
                <span className="bg-yellow-100 border border-yellow-300 text-yellow-800 text-xs font-semibold px-2 py-1 rounded flex items-center gap-1">
                  <span>🛡️</span> Trust
                </span>
                {business.isVerified && (
                  <span className="bg-blue-100 border border-blue-300 text-blue-800 text-xs font-semibold px-2 py-1 rounded flex items-center gap-1">
                    <span>✓</span>erified
                  </span>
                )}
                <span className="bg-orange-100 border border-orange-300 text-orange-800 text-xs font-semibold px-2 py-1 rounded flex items-center gap-1">
                  <span>🔥</span> Responsive
                </span>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-2 mb-3 text-gray-700">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">{business.address}</span>
            </div>

            {/* Amenities/Tags */}
            <div className="flex gap-2 mb-4 flex-wrap">
              <span className="bg-gray-100 text-gray-700 text-xs px-6 py-3 rounded-full"></span>
              <span className="bg-gray-100 text-gray-700 text-xs px-6 py-1 rounded-full"></span>
            </div>
          </Link>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            {business.phone && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = `tel:${business.phone}`;
                }}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2.5 rounded flex items-center justify-center gap-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                {business.phone}
              </button>
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