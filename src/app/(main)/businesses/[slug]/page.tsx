'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { businessService, Business, ImageObject } from '@/services/business.service';
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
import { buildOgImages, toAbsoluteUrl } from '@/config/seo.config';

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

        const normalizedImages = Array.isArray(businessData.images)
          ? businessData.images
              .map((image) => {
                if (!image) return null;
                if (typeof image === 'string') {
                  return { url: image } as ImageObject;
                }
                if (typeof image === 'object' && image.url) {
                  return image;
                }
                return null;
              })
              .filter((image): image is ImageObject => Boolean(image))
          : businessData.images;

        setBusiness({
          ...businessData,
          images: normalizedImages,
        });

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

  useEffect(() => {
    if (!business) return;

    const schemaId = `business-schema-${business.id}`;
    const existing = document.querySelector(
      `script[type="application/ld+json"][data-business-schema="${schemaId}"]`
    );
    if (existing) existing.remove();

    const { absolute: ogImage } = buildOgImages(business.coverImage || business.logo);
    const canonical = toAbsoluteUrl(`/businesses/${business.slug}`);

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: business.name,
      image: [ogImage],
      url: canonical,
      telephone: business.phone || undefined,
      email: business.email || undefined,
      description: business.description || undefined,
      address: business.address
        ? {
            '@type': 'PostalAddress',
            streetAddress: business.address,
            addressLocality: business.city?.name,
            addressCountry: 'SA',
          }
        : undefined,
      geo:
        business.latitude && business.longitude
          ? {
              '@type': 'GeoCoordinates',
              latitude: business.latitude,
              longitude: business.longitude,
            }
          : undefined,
      aggregateRating:
        business.averageRating > 0
          ? {
              '@type': 'AggregateRating',
              ratingValue: business.averageRating,
              reviewCount: business.totalReviews || 0,
            }
          : undefined,
      sameAs: business.website ? [business.website] : undefined,
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-business-schema', schemaId);
    script.textContent = JSON.stringify(structuredData, (_, value) =>
      value === undefined ? undefined : value
    );

    document.head.appendChild(script);

    return () => {
      const node = document.querySelector(
        `script[type="application/ld+json"][data-business-schema="${schemaId}"]`
      );
      if (node) node.remove();
    };
  }, [business]);

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

      <BusinessHeader business={business} />

      <BusinessTabs />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <OverviewSection business={business} />

            <ServicesSection services={services} />

            <WorkingHoursSection workingHours={business.workingHours} />

            <LocationSection business={business} />

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
            {business.city?.id && (
              <SimilarBusinesses
                categoryId={business.category.id}
                categorySlug={business.category.slug}
                locationId={business.city.id}
                locationType="city"
                currentBusinessId={business.id}
              />
            )}
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