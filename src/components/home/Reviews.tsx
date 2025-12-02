'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

interface Review {
  id: number;
  name: string;
  designation: string;
  rating: number;
  comment: string;
  avatar: string;
}

const defaultReviews: Review[] = [
  {
    id: 1,
    name: 'Sarah Johnson',
    designation: 'Marketing Director',
    rating: 5,
    comment: 'Mawjood has completely transformed how I find local services. The platform is incredibly user-friendly and the verified listings give me confidence in my choices. Highly recommend!',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop'
  },
  {
    id: 2,
    name: 'Ahmed Al-Rashid',
    designation: 'Business Owner',
    rating: 5,
    comment: 'As a business owner, listing on Mawjood was the best decision. We\'ve seen a 300% increase in customer inquiries. The platform connects us with genuinely interested customers.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop'
  },
  {
    id: 3,
    name: 'Fatima Hassan',
    designation: 'Freelance Designer',
    rating: 5,
    comment: 'Finding reliable service providers used to be a nightmare. Mawjood made it so easy! The reviews are genuine and the search functionality is excellent. Saved me so much time!',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop'
  },
  {
    id: 4,
    name: 'Mohammed Ali',
    designation: 'Restaurant Owner',
    rating: 5,
    comment: 'Our restaurant visibility increased dramatically after joining Mawjood. The platform is professional, easy to manage, and the customer support team is outstanding!',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop'
  },
  {
    id: 5,
    name: 'Layla Abdullah',
    designation: 'HR Manager',
    rating: 5,
    comment: 'Mawjood is my go-to platform for discovering local businesses. The detailed information and real customer reviews help me make informed decisions every time.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop'
  },
  {
    id: 6,
    name: 'Omar Khalil',
    designation: 'Tech Entrepreneur',
    rating: 5,
    comment: 'The best local business directory I\'ve used. Clean interface, accurate information, and excellent categorization. It\'s become an essential tool for me and my team.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop'
  }
];

export default function Reviews() {
  const { data: siteSettings } = useSiteSettings();
  const reviews = siteSettings?.reviews?.length ? (siteSettings.reviews as Review[]) : defaultReviews;
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Responsive reviews per page
  const [reviewsPerPage, setReviewsPerPage] = useState(1);
  
  // Update reviews per page based on screen size
  useEffect(() => {
    const updateReviewsPerPage = () => {
      if (window.innerWidth >= 1024) {
        setReviewsPerPage(4); // Desktop: 4 reviews
      } else if (window.innerWidth >= 768) {
        setReviewsPerPage(2); // Tablet: 2 reviews
      } else {
        setReviewsPerPage(1); // Mobile: 1 review
      }
    };
    
    updateReviewsPerPage();
    window.addEventListener('resize', updateReviewsPerPage);
    return () => window.removeEventListener('resize', updateReviewsPerPage);
  }, []);
  
  const totalSlides = reviews.length ? Math.ceil(reviews.length / reviewsPerPage) : 1;

  const renderReviewCard = (review: Review) => (
    <div
      key={review.id}
      className="group relative bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-emerald-500" />

      <div className="p-6 flex flex-col flex-1">
        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
          <Quote className="w-5 h-5" />
        </div>

        <div className="flex items-center gap-1 mb-3">
          {[...Array(Math.max(0, Math.min(5, Math.round(review.rating ?? 5))))].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          ))}
        </div>

        <h3 className="text-base font-semibold text-gray-900 mb-2">
          "One of the Superb Platform"
        </h3>

        <p className="text-gray-600 text-sm leading-relaxed line-clamp-5">
          {review.comment}
        </p>

        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-3">
          <div className="relative w-12 h-12">
            <Image
              src={review.avatar}
              alt={review.name}
              fill
              unoptimized
              className="rounded-full object-cover ring-2 ring-primary/10"
              sizes="48px"
            />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 text-sm truncate">
              {review.name}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {review.designation}
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const getVisibleReviews = () => {
    if (!reviews.length) return [];
    const start = currentSlide * reviewsPerPage;
    return reviews.slice(start, start + reviewsPerPage);
  };

  // Reset to first slide when reviewsPerPage changes
  useEffect(() => {
    setCurrentSlide(0);
  }, [reviewsPerPage]);

  return (
    <section className="py-20 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            Our Reviews
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Our clients love our services and give great & positive reviews
          </p>
        </div>

        {/* Reviews Carousel */}
        <div className="relative">
          {/* Carousel Container */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ 
                transform: `translateX(-${currentSlide * 100}%)`
              }}
            >
              {reviews.length ? (
                // Create slides based on reviewsPerPage
                Array.from({ length: totalSlides }).map((_, slideIndex) => {
                  const slideReviews = reviews.slice(
                    slideIndex * reviewsPerPage,
                    slideIndex * reviewsPerPage + reviewsPerPage
                  );
                  return (
                    <div 
                      key={slideIndex}
                      className="w-full flex-shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-2"
                    >
                      {slideReviews.map((review) => renderReviewCard(review))}
                    </div>
                  );
                })
              ) : (
                <div className="w-full text-center text-gray-500 py-10">
                  No reviews available at the moment.
                </div>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          {reviews.length > 0 && totalSlides > 1 && (
            <>
              <button
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className="absolute left-0 sm:-left-4 md:-left-6 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 rounded-full p-2 sm:p-3 shadow-lg transition-colors z-10 flex items-center justify-center"
                aria-label="Previous reviews"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <button
                onClick={nextSlide}
                disabled={currentSlide >= totalSlides - 1}
                className="absolute right-0 sm:-right-4 md:-right-6 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 rounded-full p-2 sm:p-3 shadow-lg transition-colors z-10 flex items-center justify-center"
                aria-label="Next reviews"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </>
          )}
        </div>

        {/* Pagination Dots */}
        {reviews.length > 0 && totalSlides > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {[...Array(totalSlides)].map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${index === currentSlide
                    ? 'bg-primary w-8'
                    : 'bg-gray-300 hover:bg-gray-400 w-2'
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}