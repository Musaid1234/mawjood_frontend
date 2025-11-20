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
}

const PLACEHOLDER_AD_IMAGE = 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=400&fit=crop';

export default function SidebarAd({ queryKey = 'sidebar-ad', className = '', height = 'h-64' }: SidebarAdProps) {
  const { selectedCity, selectedLocation } = useCityStore();
  const locationFilterId = selectedLocation?.id ?? selectedCity?.id;
  const locationFilterType = selectedLocation?.type ?? 'city';

  const { data, isLoading } = useQuery<Advertisement | null>({
    queryKey: [queryKey, locationFilterId, locationFilterType],
    queryFn: async (): Promise<Advertisement | null> => {
      try {
        if (locationFilterId) {
          return await advertisementService.getDisplayAdvertisement({
            locationId: locationFilterId,
            locationType: locationFilterType as 'city' | 'region' | 'country',
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
    <div className={`rounded-2xl overflow-hidden border border-gray-200 shadow-sm ${className}`}>
      {targetUrl ? (
        <Link
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Image
            src={imageUrl}
            alt={ad?.title || 'Advertisement'}
            width={400}
            height={400}
            className={`w-full ${height} object-cover`}
          />
        </Link>
      ) : (
        <Image
          src={imageUrl}
          alt={ad?.title || 'Advertisement'}
          width={400}
          height={400}
          className={`w-full ${height} object-cover`}
        />
      )}
    </div>
  );
}

