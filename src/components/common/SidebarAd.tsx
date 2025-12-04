'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { advertisementService, Advertisement } from '@/services/advertisement.service';
import { useCityStore } from '@/store/cityStore';

interface SidebarAdProps {
  queryKey?: string;
  className?: string;
  height?: string;
  adType?: 'CATEGORY' | 'TOP' | 'FOOTER' | 'BUSINESS_LISTING' | 'BLOG_LISTING' | 'HOMEPAGE';
  categoryId?: string;
}

const PLACEHOLDER_AD_IMAGE = 'https://marketplace.canva.com/EAFJFM2El4s/2/0/1131w/canva-blue-modern-business-flyer-portrait-yINAU4kvioI.jpg';

export default function SidebarAd({ queryKey = 'sidebar-ad', className = '', height = 'h-[350px]', adType = 'CATEGORY', categoryId }: SidebarAdProps) {
  const { selectedCity, selectedLocation } = useCityStore();
  const locationFilterId = selectedLocation?.id ?? selectedCity?.id;
  const locationFilterType = selectedLocation?.type ?? 'city';

  const { data, isLoading } = useQuery<Advertisement | null>({
    queryKey: [queryKey, locationFilterId, locationFilterType, adType, categoryId],
    queryFn: async (): Promise<Advertisement | null> => {
      try {
        if (locationFilterId) {
          return await advertisementService.getDisplayAdvertisement({
            locationId: locationFilterId,
            locationType: locationFilterType as 'city' | 'region' | 'country',
            adType,
            categoryId,
          });
        }
        return null;
      } catch (error) {
        console.error('Error fetching sidebar ad:', error);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const ad = data ?? null;
  const getResolvedTargetUrl = (ad: Advertisement | null) => {
    if (!ad?.targetUrl || ad.targetUrl.trim().length === 0) return null;
    return ad.targetUrl.startsWith('http')
      ? ad.targetUrl
      : `/businesses/${ad.targetUrl.replace(/^\/+/, '')}`;
  };

  const imageUrl = ad?.imageUrl || PLACEHOLDER_AD_IMAGE;
  const targetUrl = getResolvedTargetUrl(ad);

  if (isLoading) {
    return (
      <div className={`rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-gray-200 animate-pulse ${height} ${className}`} />
    );
  }

  return (
    <div className={`rounded-2xl overflow-hidden border border-gray-200 shadow-sm w-full max-w-[300px] mx-auto ${className}`}>
      {targetUrl ? (
        <Link
          href={targetUrl}
          target={ad?.openInNewTab !== false ? '_blank' : '_self'}
          rel={ad?.openInNewTab !== false ? 'noopener noreferrer' : undefined}
          className="block w-full"
        >
          <div className={`relative w-full ${height}`}>
            <Image
              src={imageUrl}
              alt={ad?.title || 'Advertisement'}
              fill
              className="object-contain"
              sizes="300px"
            />
          </div>
        </Link>
      ) : (
        <div className={`relative w-full ${height} bg-gray-50 flex items-center justify-center`}>
          <Image
            src={imageUrl}
            alt={ad?.title || 'Advertisement'}
            fill
            className="object-contain"
            sizes="300px"
          />
        </div>
      )}
    </div>
  );
}

