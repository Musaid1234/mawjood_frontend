'use client';

import { useEffect, useState } from 'react';
import { categoryService, Category } from '@/services/category.service';
import { useCityStore } from '@/store/cityStore';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CategoriesPage() {
  const { t } = useTranslation('common');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;
  const { selectedLocation, selectedCity, cities, fetchCities } = useCityStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await categoryService.fetchCategories(currentPage, limit);
        setCategories(response.data.categories);
        setTotalPages(response.data.pagination.totalPages);
        setTotal(response.data.pagination.total);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage]);

  useEffect(() => {
    if (!cities.length) {
      fetchCities();
    }
  }, [cities.length, fetchCities]);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const locationSlug =
    selectedLocation?.slug ||
    selectedCity?.slug ||
    cities.find((city) => city.name.toLowerCase().includes('riyadh'))?.slug ||
    cities[0]?.slug ||
    'riyadh';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            All Categories
          </h1>
          <p className="text-lg text-gray-600">
            Browse all business categories ({total} total)
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-lg"
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
          {filteredCategories.map((category) => (
            <Link
              key={category.id}
              href={`/${locationSlug}/${category.slug}`}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 group"
            >
              <div className="flex flex-col items-center text-center">
                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-gray-50 group-hover:bg-primary/10 transition-colors duration-300">
                  {category.icon ? (
                    <Image
                      src={category.icon}
                      alt={category.name}
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  ) : (
                    <span className="text-3xl">📁</span>
                  )}
                </div>

                {/* Name */}
                <h3 className="text-sm font-semibold text-gray-800 group-hover:text-primary transition-colors duration-300">
                  {category.name}
                </h3>

                {/* Subcategories count */}
                {category.subcategories && category.subcategories.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    {category.subcategories.length} subcategories
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* No results */}
        {filteredCategories.length === 0 && !loading && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No categories found</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </button>
            
            <div className="flex gap-2">
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                // Show first page, last page, current page, and pages around current
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === pageNum
                          ? 'bg-primary text-white'
                          : 'border hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (
                  pageNum === currentPage - 2 ||
                  pageNum === currentPage + 2
                ) {
                  return <span key={pageNum} className="px-2">...</span>;
                }
                return null;
              })}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}