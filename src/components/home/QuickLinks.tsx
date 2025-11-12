"use client";

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useCategoryStore } from '@/store/categoryStore';
import { useCityStore } from '@/store/cityStore';

const POPULAR_COUNT = 8;
const QUICK_LIST_COUNT = 40;
const TRENDING_COUNT = 40;

const joinWithSeparators = (
  items: { id: string; name: string; href: string }[],
  separator = '|'
) =>
  items.flatMap((item, index) => [
    <Link
      key={item.id}
      href={item.href}
      className="text-sm text-gray-700 hover:text-primary transition-colors"
    >
      {item.name}
    </Link>,
    index < items.length - 1 ? (
      <span
        key={`${item.id}-separator`}
        className="text-gray-300 mx-2"
        aria-hidden="true"
      >
        {separator}
      </span>
    ) : null,
  ]);

export default function QuickLinks() {
  const { categories, fetchCategories, loading } = useCategoryStore();
  const { selectedLocation, selectedCity, cities, fetchCities } = useCityStore();

  useEffect(() => {
    if (!categories.length && !loading) {
      fetchCategories();
    }
  }, [categories.length, fetchCategories, loading]);

  useEffect(() => {
    if (!cities.length) {
      fetchCities();
    }
  }, [cities.length, fetchCities]);

  const locationSlug = useMemo(() => {
    if (selectedLocation?.slug) return selectedLocation.slug;
    if (selectedCity?.slug) return selectedCity.slug;
    const fallback = cities.find((city) =>
      city.name.toLowerCase().includes('riyadh') || city.name.toLowerCase().includes('الرياض')
    );
    return fallback?.slug || cities[0]?.slug || 'riyadh';
  }, [selectedLocation, selectedCity, cities]);

  const { popular, quickList, trending } = useMemo(() => {
    const mapped = categories.map(({ id, name, slug }) => ({
      id,
      name,
      href: `/${locationSlug}/${slug}`,
    }));

    return {
      popular: mapped.slice(0, POPULAR_COUNT),
      quickList: mapped.slice(POPULAR_COUNT, POPULAR_COUNT + QUICK_LIST_COUNT),
      trending: mapped.slice(POPULAR_COUNT + QUICK_LIST_COUNT, POPULAR_COUNT + QUICK_LIST_COUNT + TRENDING_COUNT),
    };
  }, [categories, locationSlug]);

  if (!categories.length) {
    return null;
  }

  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8 border-t border-gray-100">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Popular Categories */}
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">
            Quick Links
          </h2>

          <div className="flex gap-3 overflow-x-auto pb-2 sm:flex-wrap sm:overflow-visible">
            {popular.map((category) => (
              <Link
                key={category.id}
                href={category.href}
                className="flex-shrink-0 px-4 py-2 rounded-full border border-gray-200 text-gray-800 font-medium hover:border-primary hover:text-primary transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </div>

          {quickList.length > 0 && (
            <div className="mt-6">
              <div className="flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:overflow-visible text-sm leading-7 text-gray-700">
                {joinWithSeparators(quickList)}
              </div>
            </div>
          )}
        </div>

        {/* Trending Searches */}
        {trending.length > 0 && (
          <div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
              Trending Searches
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:overflow-visible text-sm leading-7 text-gray-700">
              {joinWithSeparators(trending)}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
