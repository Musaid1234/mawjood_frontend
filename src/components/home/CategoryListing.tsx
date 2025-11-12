'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCategoryStore } from '@/store/categoryStore';
import { useCityStore } from '@/store/cityStore';
import Link from 'next/link';
import Image from 'next/image';
import { Category } from '@/services/category.service';

interface CategoryCardProps {
  category: Category;
  locationSlug: string;
  onClick?: () => void;
}

function CategorySkeleton() {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center justify-center mb-3 animate-pulse">
        <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
    </div>
  );
}

export function CategoryCard({ category, locationSlug, onClick }: CategoryCardProps) {
  const { t } = useTranslation('common');
  const [imageError, setImageError] = useState(false);

  return (
    <Link href={`/${locationSlug}/${category.slug}`}>
      <div
        className="flex flex-col items-center cursor-pointer group flex-shrink-0 min-w-[110px] md:min-w-0"
        onClick={onClick}
      >
        <div className="bg-white rounded-2xl border border-gray-300 transition-all duration-300 transform hover:scale-105 p-5 flex items-center justify-center mb-3">
          <div className="rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 bg-gray-50">
            {category.icon && !imageError ? (
              <Image
                src={category.icon}
                alt={category.name}
                width={40}
                height={40}
                className="w-10 h-10 object-contain"
                onError={() => setImageError(true)}
                unoptimized={true}
              />
            ) : (
              <span className="text-3xl">📁</span>
            )}
          </div>
        </div>
        
        <h3 className="text-sm font-semibold text-gray-800 group-hover:text-primary transition-colors duration-300 text-center leading-tight">
          {category.name}
        </h3>
      </div>
    </Link>
  );
}

export default function CategoryListing() {
  const { t } = useTranslation('common');
  const { categories, loading, error, fetchCategories } = useCategoryStore();
  const { selectedCity, selectedLocation, cities, fetchCities } = useCityStore();
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (!cities.length) {
      fetchCities();
    }
  }, [cities.length, fetchCities]);

  const locationSlug =
    selectedLocation?.slug ||
    selectedCity?.slug ||
    cities.find((city) => city.name.toLowerCase().includes('riyadh'))?.slug ||
    cities[0]?.slug ||
    'riyadh';

  if (loading || error) {
    return (
      <section ref={sectionRef} className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              {t('categories.title')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('categories.subtitle')}
            </p>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-9 md:gap-6 md:overflow-visible">
            {Array.from({ length: 17 }).map((_, index) => (
              <CategorySkeleton key={index} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section ref={sectionRef} className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
            <div className="text-red-600 text-lg font-semibold mb-2">
              {t('categories.errorTitle')}
            </div>
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => fetchCategories(true)}
              className="bg-red-600 text-white px-6 py-2 rounded-xl hover:bg-red-700 transition-colors duration-200"
            >
              {t('categories.retry')}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="py-16 px-4 sm:px-6 lg:px-8 bg-white  ">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            {t('categories.title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('categories.subtitle')}
          </p>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-9 md:gap-6 md:overflow-visible">
          {categories.slice(0, 17).map((category) => (
            <CategoryCard key={category.id} category={category} locationSlug={locationSlug} />
          ))}
          
          <Link href="/categories">
            <div className="flex flex-col items-center cursor-pointer group flex-shrink-0 min-w-[110px] md:min-w-0">
              <div className="bg-white rounded-2xl border border-gray-300 transition-all duration-300 transform hover:scale-105 p-5 flex items-center justify-center mb-3">
                <div className="rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 bg-gray-50">
                  <span className="text-3xl">📋</span>
                </div>
              </div>
              
              <h3 className="text-sm font-semibold text-gray-800 group-hover:text-primary transition-colors duration-300 text-center leading-tight">
                {t('categories.allCategories')}
              </h3>
            </div>
          </Link>
        </div>

      </div>
    </section>
  );
}