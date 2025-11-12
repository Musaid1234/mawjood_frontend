'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Business {
  name: string;
  logo?: string;
  coverImage?: string;
  images?: string[] | null;
}

interface Props {
  business: Business;
}

export default function BusinessGallery({ business }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  // Combine all images
  const galleryImages = Array.isArray(business.images) ? business.images : [];

  const allImages = [
    business.coverImage,
    business.logo,
    ...galleryImages
  ].filter(Boolean) as string[];

  // Display max 5 images in grid
  const displayImages = allImages.slice(0, 5);
  const remainingCount = Math.max(0, allImages.length - 5);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') setShowLightbox(false);
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
  };

  if (allImages.length === 0) {
    return (
      <div className="w-full h-96 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
        <div className="text-center">
          <span className="text-8xl">🏢</span>
          <p className="mt-4 text-gray-600 font-medium">No images available</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Gallery Grid - Responsive Design */}
      <div className="w-full h-[400px] md:h-[500px] grid grid-cols-4 gap-1">
        {/* Main large image - takes 2 rows and 2 columns on desktop */}
        <div 
          className="col-span-4 md:col-span-2 row-span-1 md:row-span-2 relative cursor-pointer group overflow-hidden"
          onClick={() => {
            setCurrentIndex(0);
            setShowLightbox(true);
          }}
        >
          <Image
            src={displayImages[0]}
            alt={business.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
        </div>

        {/* Smaller images grid */}
        {displayImages.slice(1, 5).map((image, idx) => (
          <div
            key={idx}
            className="relative cursor-pointer group overflow-hidden"
            onClick={() => {
              setCurrentIndex(idx + 1);
              setShowLightbox(true);
            }}
          >
            <Image
              src={image}
              alt={`${business.name} ${idx + 2}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            
            {/* Show "+X more" on last image if there are more images */}
            {idx === 3 && remainingCount > 0 && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
                <div className="text-center">
                  <span className="text-white text-2xl md:text-3xl font-bold">
                    +{remainingCount}
                  </span>
                  <p className="text-white text-sm mt-1">more photos</p>
                </div>
              </div>
            )}
            
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {showLightbox && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onKeyDown={(e: any) => handleKeyDown(e)}
        >
          {/* Close Button */}
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-50 p-2 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Close lightbox"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Image Counter */}
          <div className="absolute top-4 left-4 text-white text-lg z-50 bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
            {currentIndex + 1} / {allImages.length}
          </div>

          {/* Main Image */}
          <div className="relative w-full h-full max-w-7xl max-h-[85vh] mx-4">
            <Image
              src={allImages[currentIndex]}
              alt={`${business.name} ${currentIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {/* Navigation Buttons */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-3 backdrop-blur-sm transition-all"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-3 backdrop-blur-sm transition-all"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Thumbnails */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-full px-4 py-2 bg-black/50 rounded-lg backdrop-blur-sm">
            {allImages.map((image, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded overflow-hidden transition-all ${
                  idx === currentIndex 
                    ? 'ring-2 ring-white scale-110' 
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <Image
                  src={image}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}