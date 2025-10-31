'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { businessService } from '@/services/business.service';
import { useCityStore } from '@/store/cityStore';
import { categoryService } from '@/services/category.service';
import BusinessCard from '@/components/business/BusinessCard';
import BusinessListCard from '@/components/business/BusinessListCard';
import { LayoutGrid, List } from 'lucide-react';

export default function BusinessesPage() {
  const { selectedCity } = useCityStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    categoryId: '',
    rating: '',
    priceLevel: '',
    sortBy: 'newest',
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.fetchCategories(),
  });

  // Fetch businesses
  const { data, isLoading } = useQuery({
    queryKey: ['businesses', currentPage, selectedCity?.id, filters],
    queryFn: () =>
      businessService.searchBusinesses({
        page: currentPage,
        limit: 12,
        cityId: selectedCity?.id,
        categoryIds: filters.categoryId ? [filters.categoryId] : undefined,
      }),
  });

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            All Businesses {selectedCity && `in ${selectedCity.name}`}
          </h1>
          <p className="text-gray-600">
            Discover the best local businesses
          </p>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-3">
              <select
                value={filters.categoryId}
                onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">CATEGORIES</option>
                {categoriesData?.data.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <select
                value={filters.rating}
                onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">RATING FILTER</option>
                <option value="5">5 Stars</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
              </select>

              <select
                value={filters.priceLevel}
                onChange={(e) => setFilters({ ...filters, priceLevel: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">PRICE FILTER</option>
                <option value="$">$ - Budget</option>
                <option value="$$">$$ - Moderate</option>
                <option value="$$$">$$$ - Premium</option>
              </select>

              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                DISTANCE
              </button>

              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                MORE FILTER
              </button>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
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

        {/* Results Info & Sort */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-700 font-medium">
            {totalResults} Listings Found
          </p>
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="newest">SHORT LISTINGS: Newest</option>
            <option value="rating">Highest Rated</option>
            <option value="reviews">Most Reviews</option>
            <option value="az">A to Z</option>
          </select>
        </div>

        {/* Loading State */}
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
            {/* Business Grid/List */}
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
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
                  <BusinessListCard
                    key={business.id}
                    business={business}
                    onToggleFavorite={toggleFavorite}
                    isFavorite={favorites.has(business.id)}
                  />
                )
              ))}
            </div>

            {/* No Results */}
            {data?.businesses.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl">
                <h3 className="text-xl font-semibold mb-2">No businesses found</h3>
                <p className="text-gray-600">Try adjusting your filters</p>
              </div>
            )}

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