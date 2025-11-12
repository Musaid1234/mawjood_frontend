'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCityStore } from '@/store/cityStore';

export default function LegacyCategoryRedirect() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { cities, selectedCity, selectedLocation, fetchCities } = useCityStore();

  useEffect(() => {
    if (!cities.length) {
      fetchCities();
    }
  }, [cities.length, fetchCities]);

  useEffect(() => {
    if (!slug) return;

    const fallbackSlug =
      selectedLocation?.slug ||
      selectedCity?.slug ||
      cities.find((city) => city.name.toLowerCase().includes('riyadh'))?.slug ||
      cities[0]?.slug ||
      'riyadh';

    router.replace(`/${fallbackSlug}/${slug}`);
  }, [slug, selectedLocation, selectedCity, cities, router]);

  return null;
}