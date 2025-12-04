'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { businessService } from '@/services/business.service';
import { useCityStore } from '@/store/cityStore';
import { Category, categoryService } from '@/services/category.service';
import BusinessCard from '@/components/business/BusinessCard';
import BusinessListCard from '@/components/business/BusinessListCard';
import { LayoutGrid, List, ChevronDown } from 'lucide-react';
import CategoryDropdown from '@/components/dashboard/add-listing/CategoryDropdown';
import SidebarAd from '@/components/common/SidebarAd';

type FiltersState = {
  categoryId: string;
  rating: string;
  sortBy: string;
  search: string;
};

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating_high', label: 'Rating: High to Low' },
  { value: 'rating_low', label: 'Rating: Low to High' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'verified', label: 'Verified First' },
  { value: 'not_verified', label: 'Not Verified First' },
  { value: 'name_asc', label: 'Alphabetical (A-Z)' },
  { value: 'name_desc', label: 'Alphabetical (Z-A)' },
];

const sortCategoriesAlphabetically = (items: Category[]): Category[] =>
  [...items]
    .map((item) => ({
      ...item,
      subcategories: item.subcategories
        ? sortCategoriesAlphabetically(item.subcategories)
        : [],
    }))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

export default function BusinessesPage() {
  const { selectedCity, selectedLocation } = useCityStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<FiltersState>({
    categoryId: '',
    rating: '',
    sortBy: 'popular',
    search: '',
  });
  const [searchTerm, setSearchTerm] = useState('');

  const updateFilters = (updates: Partial<FiltersState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
    setCurrentPage(1);
  };

  useEffect(() => {
    setSearchTerm(filters.search);
  }, [filters.search]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateFilters({ search: searchTerm.trim() });
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    updateFilters({ search: '' });
  };

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.fetchCategories(),
  });

  const sortedCategories = useMemo(() => {
    if (!categoriesData?.data?.categories) return [];
    return sortCategoriesAlphabetically(categoriesData.data.categories);
  }, [categoriesData?.data?.categories]);

  // Fetch businesses
  const locationFilterId = selectedLocation?.id ?? selectedCity?.id;
  const locationFilterType = selectedLocation?.type ?? 'city';

  const { data, isLoading } = useQuery({
    queryKey: ['businesses', currentPage, locationFilterId, locationFilterType, filters],
    queryFn: () =>
      businessService.searchBusinesses({
        page: currentPage,
        limit: 10,
        locationId: locationFilterId,
        locationType: locationFilterType,
        categoryIds: filters.categoryId ? [filters.categoryId] : undefined,
        search: filters.search.trim().length ? filters.search.trim() : undefined,
        sortBy: filters.sortBy,
        rating: filters.rating ? Number(filters.rating) : undefined,
      }),
  });

  const locationContext = data?.locationContext;


  const toggleFavorite = (businessId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(businessId)) {
        newFavorites.delete(businessId);
      } else {
        newFavorites.add(businessId);
      }
      return newFavorites;
    });
  };

  const totalResults = data?.pagination?.total || 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            All Businesses{' '}
            {(selectedLocation || selectedCity) && `in ${(selectedLocation ?? selectedCity)?.name}`}
          </h1>
          <p className="text-gray-600">
            Discover the best local businesses
          </p>
          {locationContext?.fallbackApplied && locationContext.applied && (
            <div className="mt-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Note:</span> No businesses found in {locationContext.requested?.name || 'the selected location'}. 
                Showing results from <span className="font-semibold">{locationContext.applied.name}</span> ({locationContext.applied.type}).
              </p>
            </div>
          )}
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-xl mb-6 space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <form
              onSubmit={handleSearchSubmit}
              className="flex w-full lg:max-w-md gap-2"
            >
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search businesses"
                style={{ paddingTop: '0.875rem', paddingBottom: '0.875rem' }}
                className="flex-1 px-4  border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {filters.search && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="px-3 py-2 text-sm text-gray-500 hover:text-primary transition-colors"
                >
                  Clear
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Search
              </button>
            </form>

            <div className="flex flex-wrap gap-3 items-start">
              <div className="w-full sm:w-64">
                {categoriesLoading ? (
                  <div className="h-12 rounded-lg bg-gray-100 animate-pulse" />
                ) : (
                  <>
                    <CategoryDropdown
                      categories={sortedCategories}
                      value={filters.categoryId}
                      onChange={(categoryId) => updateFilters({ categoryId })}
                    />
                    {filters.categoryId && (
                      <button
                        type="button"
                        onClick={() => updateFilters({ categoryId: '' })}
                        className="mt-2 text-xs text-primary hover:text-primary/80 transition-colors"
                      >
                        Clear category
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* <select
                value={filters.rating}
                onChange={(event) => updateFilters({ rating: event.target.value })}
                style={{ paddingTop: '0.875rem', paddingBottom: '0.875rem' }}
                className="px-4 border border-gray-300 rounded-lg text-sm bg-white text-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Rating Filter</option>
                <option value="5">5 Stars</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
              </select> */}

              <div className="relative">
                <select
                  value={filters.sortBy}
                  onChange={(event) => updateFilters({ sortBy: event.target.value })}
                  style={{ paddingTop: '0.780rem', paddingBottom: '0.780rem', paddingRight: '2.5rem' }}
                  className="px-4 pr-10 border border-gray-300 rounded-lg bg-white text-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent appearance-none cursor-pointer"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              <div style={{ padding: '0.40rem' }} className="flex items-center gap-2 bg-gray-100 rounded-lg self-start sm:self-auto">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-4 h-4 inline mr-1" />
                List
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <LayoutGrid className="w-4 h-4 inline mr-1" />
                Grid
              </button>
            </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md h-96 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Business Grid/List with Sidebar */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Main Content */}
              <div className="flex-1 min-w-0">
                {data?.businesses.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-xl">
                    <h3 className="text-xl font-semibold mb-2">No businesses found</h3>
                    <p className="text-gray-600">Try adjusting your filters</p>
                  </div>
                ) : (
                  <div className={`grid gap-6 ${
                    viewMode === 'grid' 
                      ? 'grid-cols-1 md:grid-cols-2' 
                      : 'grid-cols-1'
                  }`}>
                    {data?.businesses.map((business) => (
                      viewMode === 'grid' ? (
                        <BusinessCard
                          key={business.id}
                          business={business}
                          onToggleFavorite={toggleFavorite}
                          isFavorite={favorites.has(business.id)}
                        />
                      ) : (
                        <div key={business.id} className="max-w-4xl">
                          <BusinessListCard
                            business={business}
                            onToggleFavorite={toggleFavorite}
                            isFavorite={favorites.has(business.id)}
                          />
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>

              {/* Sidebar Ad - Always shown with consistent width */}
              <div className="lg:w-80 flex-shrink-0">
                <div className="sticky top-18">
                  <SidebarAd queryKey="sidebar-ad-businesses" height="h-96" adType="BUSINESS_LISTING" />
                </div>
              </div>
            </div>

            {/* Pagination */}
            {data && data.pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {[...Array(data.pagination.totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === i + 1
                        ? 'bg-primary text-white'
                        : 'border hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                  disabled={currentPage === data.pagination.totalPages}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}