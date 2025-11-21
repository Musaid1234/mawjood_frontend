'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { advertisementService, Advertisement } from '@/services/advertisement.service';
import { useCityStore } from '@/store/cityStore';

// Dummy banner images as fallback
const DUMMY_BANNERS = [
  {
    id: 'dummy-1',
    imageUrl: 'https://www.techpluto.com/wp-content/uploads/2021/10/MM_advertisement-examples-1024x316.png',
    targetUrl: '#',
    title: 'Special Offer',
  },
  {
    id: 'dummy-2',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=400&fit=crop',
    targetUrl: '#',
    title: 'New Arrivals',
  },
  {
    id: 'dummy-3',
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=400&fit=crop',
    targetUrl: '#',
    title: 'Best Deals',
  },
];

export default function AdvertisementBanner() {
  const { selectedLocation, selectedCity } = useCityStore();

  // Try to fetch ads from backend
  const { data: ads, isLoading } = useQuery<Advertisement[]>({
    queryKey: ['advertisements', selectedLocation?.id, selectedCity?.id],
    queryFn: async (): Promise<Advertisement[]> => {
      try {
        const locationId = selectedLocation?.id || selectedCity?.id;
        const locationType = selectedLocation?.type || 'city';
        
        if (locationId) {
          const ad = await advertisementService.getDisplayAdvertisement({
            locationId,
            locationType: locationType as 'city' | 'region' | 'country',
          });
          return ad ? [ad] : [];
        }
        return [];
      } catch (error) {
        console.error('Error fetching advertisements:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Use dummy banners if no ads are available
  const adsArray: Advertisement[] = Array.isArray(ads) ? ads : [];
  const displayBanners = adsArray.length > 0
    ? adsArray.map((ad) => ({
        id: ad.id,
        imageUrl: ad.imageUrl,
        targetUrl: ad.targetUrl || '#',
        title: ad.title,
      }))
    : DUMMY_BANNERS;

  if (isLoading && adsArray.length === 0) {
    return (
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="relative h-40 md:h-48 rounded-2xl bg-gray-200 animate-pulse w-full" />
        </div>
      </section>
    );
  }

  if (!displayBanners || displayBanners.length === 0) {
    return null;
  }

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {displayBanners.length > 0 && (
          <Link
            href={displayBanners[0].targetUrl || '#'}
            className="group block relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 h-40 md:h-48 w-full"
          >
            <Image
              src={displayBanners[0].imageUrl}
              alt={displayBanners[0].title || 'Advertisement'}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>
        )}
      </div>
    </section>
  );
}
