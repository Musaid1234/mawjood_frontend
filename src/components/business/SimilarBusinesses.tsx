'use client';

import { useState, useEffect } from 'react';
import { Star, MapPin, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { businessService } from '@/services/business.service';

interface Business {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  coverImage?: string;
  address: string;
  averageRating: number;
  totalReviews: number;
  category: {
    name: string;
  };
  city: {
    name: string;
  };
}

interface Props {
  categoryId: string;
  cityId: string;
  currentBusinessId: string;
}

export default function SimilarBusinesses({ categoryId, cityId, currentBusinessId }: Props) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimilarBusinesses = async () => {
      try {
        setLoading(true);
        const data = await businessService.searchBusinesses({
          categoryId,
          cityId,
          limit: 6,
        });

        // Filter out current business
        const filtered = data.businesses.filter((b: Business) => b.id !== currentBusinessId);
        setBusinesses(filtered.slice(0, 4));
      } catch (error) {
        console.error('Error fetching similar businesses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarBusinesses();
  }, [categoryId, cityId, currentBusinessId]);

  if (loading) {
    return (
      <section className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (businesses.length === 0) {
    return null;
  }

  return (
    <section id='explore' className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Similar Businesses</h2>
        <Link
          href={`/businesses?categoryId=${categoryId}&cityId=${cityId}`}
          className="flex items-center gap-1 text-primary hover:text-primary/80 font-semibold transition-colors text-sm"
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {businesses.map((business) => (
          <Link
            key={business.id}
            href={`/businesses/${business.slug}`}
            className="group"
          >
            <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300">
              {/* Image */}
              <div className="relative h-40 bg-gray-200">
                {business.coverImage || business.logo ? (
                  <Image
                    src={business.coverImage || business.logo || '/placeholder.jpg'}
                    alt={business.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-6xl">🏢</span>
                  </div>
                )}
                
                {/* Rating Badge */}
                {business.averageRating > 0 && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-white px-2 py-1 rounded shadow-md">
                    <span className="text-sm font-bold text-gray-900">
                      {business.averageRating.toFixed(1)}
                    </span>
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                  {business.name}
                </h3>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="line-clamp-1">{business.address}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {business.category.name}
                  </span>
                  {business.totalReviews > 0 && (
                    <span className="text-gray-500">
                      {business.totalReviews} {business.totalReviews === 1 ? 'review' : 'reviews'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}