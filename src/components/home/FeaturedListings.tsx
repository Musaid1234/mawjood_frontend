'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Phone, MapPin, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { businessService, Business } from '@/services/business.service';
import { useCityStore } from '@/store/cityStore';

export default function FeaturedListings() {
    const { selectedCity } = useCityStore();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());

    // Fetch featured businesses using React Query
    const { data: businesses, isLoading, error } = useQuery({
        queryKey: ['featured-businesses', selectedCity?.id],
        queryFn: () => businessService.getFeaturedBusinesses({
            limit: 8,
            cityId: selectedCity?.id,
        }),
    });

    const itemsPerPage = 4;
    const totalSlides = businesses ? Math.ceil(businesses.length / itemsPerPage) : 0;

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    };

    const toggleFavorite = (businessId: string) => {
        setFavorites((prev) => {
            const newFavorites = new Set(prev);
            if (newFavorites.has(businessId)) {
                newFavorites.delete(businessId);
            } else {
                newFavorites.add(businessId);
            }
            return newFavorites;
        });
    };

    const getVisibleBusinesses = () => {
        if (!businesses) return [];
        const start = currentSlide * itemsPerPage;
        return businesses.slice(start, start + itemsPerPage);
    };

    const getPriceLevel = (rating: number) => {
        if (rating >= 4.5) return '$$$';
        if (rating >= 3.5) return '$$';
        return '$';
    };

    if (isLoading) {
        return (
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900">Loading Featured Listings...</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-lg shadow-md h-96 animate-pulse" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (error || !businesses || businesses.length === 0) {
        return null;
    }

    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-900 mb-2">
                        Trending & Popular
                    </h2>
                    <p className="text-gray-600 text-lg">
                        Explore Hot & Popular Business Listings
                    </p>
                </div>

                {/* Listings Grid */}
                <div className="relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {getVisibleBusinesses().map((business) => (
                            <div
                                key={business.id}
                                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
                            >
                                {/* Image Container */}
                                <div className="relative h-48 group">
                                    <Link href={`/businesses/${business.slug}`}>
                                        <Image
                                            src={business.coverImage || business.logo || '/placeholder-business.jpg'}
                                            alt={business.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                        />
                                    </Link>



                                    {/* Favorite Button */}
                                    <button
                                        onClick={() => toggleFavorite(business.id)}
                                        className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                                        aria-label="Add to favorites"
                                    >
                                        <Heart
                                            className={`w-5 h-5 ${favorites.has(business.id)
                                                ? 'fill-red-500 text-red-500'
                                                : 'text-gray-600'
                                                }`}
                                        />
                                    </button>

                                    {business.user && (
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
                                                    <div className="w-full h-full flex items-center justify-center bg-primary text-white font-semibold">
                                                        {business.user.firstName?.[0]}{business.user.lastName?.[0]}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <Link href={`/businesses/${business.slug}`}>
                                        <h3 className="font-semibold text-md text-gray-900 mb-1 hover:text-primary transition-colors flex items-center gap-2">
                                            {business.name}
                                            {business.isVerified && (
                                                <svg
                                                    className="w-5 h-5 text-green-500"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            )}
                                        </h3>
                                    </Link>

                                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                                        {business.description}
                                    </p>

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

                                    {/* Category & Rating */}
                                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                                        <div className="flex items-center gap-1">
                                            <div className="relative">
                                                🏷️
                                            </div>
                                            <span className="text-sm font-medium text-gray-700 truncate">
                                                {business.category.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <div className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                                                <span>{business.averageRating > 0 ? business.averageRating.toFixed(1) : '5.0'}</span>
                                                <Star className="w-3 h-3 fill-current" />
                                            </div>
                                            <span className="text-xs text-gray-600 ml-1 whitespace-nowrap">
                                                {business.totalReviews || 0} Reviews
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Navigation Arrows */}
                    {totalSlides > 1 && (
                        <>
                            <button
                                onClick={prevSlide}
                                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white hover:bg-gray-100 text-gray-800 rounded-full p-3 shadow-lg transition-colors z-10"
                                aria-label="Previous slide"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={nextSlide}
                                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white hover:bg-gray-100 text-gray-800 rounded-full p-3 shadow-lg transition-colors z-10"
                                aria-label="Next slide"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </>
                    )}
                </div>

                {/* Pagination Dots */}
                {totalSlides > 1 && (
                    <div className="flex justify-center gap-2 mt-8">
                        {[...Array(totalSlides)].map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`w-2 h-2 rounded-full transition-all ${index === currentSlide
                                    ? 'bg-primary w-8'
                                    : 'bg-gray-300 hover:bg-gray-400'
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                )}

                {/* View All Button */}
                <div className="text-center mt-12">
                    <Link
                        href="/businesses"
                        className="inline-block bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
                    >
                        View All Listings
                    </Link>
                </div>
            </div>
        </section>
    );
}