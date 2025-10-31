'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { categoryService, Category } from '@/services/category.service';
import { businessService, Business } from '@/services/business.service';
import { useCityStore } from '@/store/cityStore';
import Link from 'next/link';
import BusinessListingCard from '@/components/business/BusinessListingCard';

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const cityIdFromUrl = searchParams.get('cityId');

  const { cities, selectedCity } = useCityStore();
  const [category, setCategory] = useState<Category | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [businessLoading, setBusinessLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const effectiveCityId = cityIdFromUrl || selectedCity?.id;
  const effectiveCity = cities.find(c => c.id === effectiveCityId);
  const cityName = effectiveCity?.name || selectedCity?.name || 'Saudi Arabia';

  // Fetch category
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        const response = await categoryService.fetchCategoryBySlug(slug);
        setCategory(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load category');
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [slug]);

  // Fetch businesses
  useEffect(() => {
    if (category && (!category.subcategories || category.subcategories.length === 0)) {
      fetchBusinesses();
    }
  }, [category, currentPage, cityIdFromUrl]);

  const fetchBusinesses = async () => {
    if (!category) return;

    try {
      setBusinessLoading(true);

      const categoryIds = [category.id];

      const response = await businessService.searchBusinesses({
        categoryIds: categoryIds,
        cityId: effectiveCityId || undefined, // Use effectiveCityId instead of cityIdFromUrl
        page: currentPage,
        limit: 20,
      });

      console.log('API Response:', response); // Debug log

      setBusinesses(response.businesses || []); // ✅ FIXED
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalResults(response.pagination?.total || 0);
    } catch (err) {
      console.error('Failed to fetch businesses:', err);
      setBusinesses([]);
      setTotalResults(0);
    } finally {
      setBusinessLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
          <Link href="/" className="bg-primary text-white px-6 py-3 rounded-lg">Go Home</Link>
        </div>
      </div>
    );
  }

  // Show subcategories
  if (category.subcategories && category.subcategories.length > 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <nav className="flex mb-6 text-sm">
            <Link href="/" className="text-gray-500 hover:text-primary">{cityName}</Link>
            <span className="mx-2">&gt;</span>
            <span className="text-gray-800">{category.name}</span>
          </nav>

          <h1 className="text-3xl font-bold mb-8">Popular {category.name} in {cityName}</h1>

          <div className="bg-white rounded-2xl shadow-sm divide-y">
            {category.subcategories.map((sub) => (
              <Link
                key={sub.id}
                href={`/categories/${sub.slug}${effectiveCityId ? `?cityId=${effectiveCityId}` : ''}`}
                className="flex items-center justify-between p-6 hover:bg-gray-50 group"
              >
                <h3 className="text-lg font-medium group-hover:text-primary">{sub.name}</h3>
                <svg className="w-6 h-6 text-gray-400 group-hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show business listings
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex mb-3 text-sm">
          <Link href="/" className="text-gray-500 hover:text-primary">{cityName}</Link>
          <span className="mx-1.5">&gt;</span>
          <span className="text-gray-800">{category.name}</span>
          <span className="mx-1.5">&gt;</span>
          <span>{totalResults} Listings</span>
        </nav>

        <h1 className="text-3xl font-bold mb-8">Popular {category.name} in {cityName}</h1>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 mb-6 flex gap-3 overflow-x-auto">
          <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm whitespace-nowrap">Sort by</button>
          <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm whitespace-nowrap">⭐ Top Rated</button>
          <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm whitespace-nowrap">✓ Verified</button>
        </div>

        {businessLoading ? (
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : businesses.length > 0 ? (
          <div className="space-y-6">
            {businesses.map((business) => (
              <BusinessListingCard key={business.id} business={business} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl">
            <h3 className="text-xl font-semibold mb-2">No businesses found</h3>
            <p className="text-gray-600">Check back later for new listings</p>
          </div>
        )}
      </div>
    </div>
  );
}