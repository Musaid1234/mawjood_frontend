'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { LayoutGrid, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { categoryService, Category } from '@/services/category.service';
import { businessService, Business } from '@/services/business.service';
import BusinessCard from '@/components/business/BusinessCard';
import BusinessListCard from '@/components/business/BusinessListCard';

type FiltersState = {
  search: string;
  rating: string;
  sortBy: string;
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

const RESULTS_PER_PAGE = 20;

const formatSlugToName = (slug: string) =>
  slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export default function GlobalCategoryPage() {
  const params = useParams<{ slug: string }>();
  const categorySlug = params?.slug?.toLowerCase() || '';

  const [category, setCategory] = useState<Category | null>(null);
  const [loadingCategory, setLoadingCategory] = useState(true);
  const [businessLoading, setBusinessLoading] = useState(false);
  const [businessError, setBusinessError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FiltersState>({
    search: '',
    rating: '',
    sortBy: 'popular',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const canonicalPath = useMemo(() => `/category/${categorySlug}`, [categorySlug]);

  useEffect(() => {
    setCurrentPage(1);
    setFilters({ search: '', rating: '', sortBy: 'popular' });
    setSearchTerm('');
  }, [categorySlug]);

  useEffect(() => {
    let cancelled = false;

    const loadCategory = async () => {
      if (!categorySlug) return;
      setLoadingCategory(true);
      setError(null);
      try {
        const response = await categoryService.fetchCategoryBySlug(categorySlug);
        if (cancelled) return;

        const categoryData = response?.data ?? null;
        if (!categoryData) {
          setCategory(null);
          setError('Category not found');
          return;
        }

        setCategory(categoryData);
        setError(null);
      } catch (err) {
        console.error('Failed to load category:', err);
        if (!cancelled) {
          setCategory(null);
          setError('Unable to load category');
        }
      } finally {
        if (!cancelled) {
          setLoadingCategory(false);
        }
      }
    };

    loadCategory();

    return () => {
      cancelled = true;
    };
  }, [categorySlug]);

  useEffect(() => {
    if (!category || (category.subcategories && category.subcategories.length > 0)) {
      setBusinesses([]);
      setTotalResults(0);
      setTotalPages(1);
      setBusinessLoading(false);
      return;
    }

    let cancelled = false;

    const fetchBusinesses = async () => {
      setBusinessLoading(true);
      setBusinessError(null);
      try {
        const response = await businessService.searchBusinesses({
          categoryIds: [category.id],
          page: currentPage,
          limit: RESULTS_PER_PAGE,
          search: filters.search.trim().length ? filters.search.trim() : undefined,
          rating: filters.rating ? Number(filters.rating) : undefined,
          sortBy: filters.sortBy,
        });

        if (cancelled) return;

        setBusinesses(response.businesses || []);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalResults(response.pagination?.total || 0);
      } catch (err) {
        console.error('Failed to fetch businesses:', err);
        if (!cancelled) {
          setBusinesses([]);
          setBusinessError('Failed to load businesses. Please try again.');
          setTotalPages(1);
          setTotalResults(0);
        }
      } finally {
        if (!cancelled) {
          setBusinessLoading(false);
        }
      }
    };

    fetchBusinesses();

    return () => {
      cancelled = true;
    };
  }, [category, currentPage, filters]);

  useEffect(() => {
    if (
      !category ||
      (category.subcategories && category.subcategories.length > 0) ||
      businesses.length === 0
    ) {
      return;
    }

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${category.name} Businesses`,
      description:
        category.description ||
        `Discover verified ${category.name.toLowerCase()} businesses listed on Mawjood.`,
      url: canonicalPath,
      numberOfItems: totalResults,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: businesses.map((business, index) => ({
          '@type': 'ListItem',
          position: index + 1 + (currentPage - 1) * RESULTS_PER_PAGE,
          url: `/businesses/${business.slug}`,
          name: business.name,
          item: {
            '@type': 'LocalBusiness',
            name: business.name,
            image: business.coverImage || business.logo || undefined,
            telephone: business.phone,
            address: business.address,
            url: `/businesses/${business.slug}`,
            aggregateRating:
              business.averageRating > 0
                ? {
                    '@type': 'AggregateRating',
                    ratingValue: business.averageRating,
                    reviewCount: business.totalReviews || 0,
                  }
                : undefined,
            areaServed: business.city?.name,
            knowsAbout: category.name,
          },
        })),
      },
    };

    const existing = document.querySelector(
      'script[type="application/ld+json"][data-global-category-page]'
    );
    if (existing) existing.remove();

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-global-category-page', 'true');
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.querySelector(
        'script[type="application/ld+json"][data-global-category-page]'
      );
      if (scriptToRemove) scriptToRemove.remove();
    };
  }, [category, businesses, totalResults, canonicalPath, currentPage]);

  useEffect(() => {
    setSearchTerm(filters.search);
  }, [filters.search]);

  const updateFilters = (updates: Partial<FiltersState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
    setCurrentPage(1);
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateFilters({ search: searchTerm.trim() });
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    updateFilters({ search: '' });
  };

  const categoryName = category?.name || formatSlugToName(categorySlug);

  if (loadingCategory) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">Category Not Found</h1>
          <p className="text-gray-600">The category you are looking for does not exist.</p>
          <Link
            href="/"
            className="inline-flex items-center px-5 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (category.subcategories && category.subcategories.length > 0) {
    return (
      <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <nav className="flex items-center gap-2 text-sm mb-6 text-gray-600">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span>&gt;</span>
            <span className="text-gray-900 font-medium">{categoryName}</span>
          </nav>

          <h1 className="text-3xl font-bold mb-4">
            Explore {categoryName} subcategories
          </h1>
          <p className="text-gray-600 mb-8">
            Choose a subcategory to browse verified businesses globally.
          </p>

          <div className="bg-white rounded-2xl border divide-y">
            {category.subcategories.map((sub) => (
              <Link
                key={sub.id}
                href={`/category/${sub.slug}`}
                className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{sub.name}</h3>
                  {sub.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{sub.description}</p>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-4">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span>&gt;</span>
            <span className="text-gray-900 font-medium">{categoryName}</span>
            <span>&gt;</span>
            <span>
              {totalResults} {totalResults === 1 ? 'Listing' : 'Listings'}
            </span>
          </nav>

          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {categoryName} businesses
            </h1>
            <p className="text-gray-600">
              Verified {categoryName.toLowerCase()} companies from every city we operate in.
            </p>
          </header>

          <div className="bg-white rounded-xl mb-6 space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <form onSubmit={handleSearchSubmit} className="flex w-full md:max-w-md gap-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder={`Search within ${categoryName}`}
                  className="flex-1 px-4 border border-gray-300 rounded-lg text-sm py-3 focus:ring-2 focus:ring-primary focus:border-transparent"
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

              <div className="flex flex-wrap gap-3">
                <select
                  value={filters.sortBy}
                  onChange={(event) => updateFilters({ sortBy: event.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white text-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                  <button
                    type="button"
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
                    type="button"
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

            {filters.search && (
              <div className="text-xs text-gray-500">Filtered by search term “{filters.search}”</div>
            )}
          </div>

          {businessError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {businessError}
            </div>
          )}

          {businessLoading ? (
            <div className={viewMode === 'grid' ? 'grid gap-6 grid-cols-1 sm:grid-cols-2' : 'space-y-6'}>
              {[...Array(viewMode === 'grid' ? 4 : 5)].map((_, index) => (
                <div key={index} className="bg-white rounded-xl p-6 animate-pulse h-40" />
              ))}
            </div>
          ) : businesses.length > 0 ? (
            <>
              {viewMode === 'grid' ? (
                <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
                  {businesses.map((business) => (
                    <BusinessCard key={business.id} business={business} />
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {businesses.map((business) => (
                    <div key={business.id} className="max-w-4xl">
                      <BusinessListCard business={business} />
                    </div>
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-between gap-4 mt-8 border-t pt-6">
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-sm disabled:opacity-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-sm disabled:opacity-50"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-xl border">
              <h3 className="text-xl font-semibold mb-2 text-gray-900">No businesses found</h3>
              <p className="text-gray-600">Try another search term or check back later.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


