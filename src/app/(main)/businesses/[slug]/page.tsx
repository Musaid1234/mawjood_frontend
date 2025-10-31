'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { businessService, Business } from '@/services/business.service';
import {
  BusinessHeader,
  BusinessGallery,
  BusinessTabs,
  OverviewSection,
  QuickInfoSection,
  ServicesSection,
  LocationSection,
  WorkingHoursSection,
  ReviewsSection,
  SimilarBusinesses,
} from '@/components/business';
import Link from 'next/link';

interface Service {
  id: string;
  name: string;
  description?: string;
  price?: number;
  duration?: number;
}

export default function BusinessDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch business data
        const businessData = await businessService.getBusinessBySlug(slug);
        setBusiness(businessData);

        if (businessData?.id) {
          businessService.trackBusinessView(businessData.id);
        }

        setServices(businessData.services || []);
      } catch (err) {
        console.error('Error fetching business:', err);
        setError('Failed to load business details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchData();
    }
  }, [slug]);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Gallery Skeleton */}
        <div className="w-full h-[400px] md:h-[500px] bg-gray-200 animate-pulse" />

        {/* Header Skeleton */}
        <div className="bg-white shadow-sm border-b p-6">
          <div className="max-w-7xl mx-auto">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
            <div>
              <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😞</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Business Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            {error || "The business you're looking for doesn't exist or has been removed."}
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Gallery */}
      <BusinessGallery business={business} />

      {/* Header with basic info and action buttons */}
      <BusinessHeader business={business} />

      {/* Scrollable Navigation Tabs */}
      <BusinessTabs />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Section */}
            <OverviewSection business={business} />

            <ServicesSection services={services} />

            {/* Working Hours */}
            <WorkingHoursSection workingHours={business.workingHours} />

            {/* Location & Map */}
            <LocationSection business={business} />

            {/* Reviews */}
            <ReviewsSection
              businessId={business.id}
              reviews={business.reviews || []}
              averageRating={business.averageRating}
              totalReviews={business.totalReviews}
              onReviewAdded={() => {
                // Refetch business data
                businessService.getBusinessBySlug(slug).then((data) => {
                  setBusiness(data);
                }).catch(console.error);
              }}
            />

            {/* Similar Businesses */}
            <SimilarBusinesses
              categoryId={business.category.id}
              cityId={business.city.id}
              currentBusinessId={business.id}
            />
          </div>

          {/* Right Column: Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-[200px]">
              <QuickInfoSection business={business} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}