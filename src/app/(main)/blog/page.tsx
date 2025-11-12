'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { blogService, BlogCategory } from '@/services/blog.service';
import BlogCard from '@/components/blog/BlogCard';
import { Input } from '@/components/ui/input';
import { Loader2, Search, X } from 'lucide-react';

const BLOGS_PER_PAGE = 12;

interface BlogsListingProps {
  initialCategorySlug?: string | null;
  categoryInfo?: BlogCategory | null;
}

export function BlogsListing({ initialCategorySlug = null, categoryInfo = null }: BlogsListingProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategorySlug);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(categoryInfo?.name ?? null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setSelectedCategory(initialCategorySlug ?? null);
    setSelectedCategoryName(categoryInfo?.name ?? null);
    setCurrentPage(1);
  }, [initialCategorySlug, categoryInfo?.name]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedCategory]);

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: () => blogService.getCategories(),
    staleTime: 10 * 60 * 1000,
  });

  const categories = useMemo(() => categoriesData ?? [], [categoriesData]);

  useEffect(() => {
    if (selectedCategory) {
      const match = categories.find((category) => category.slug === selectedCategory);
      if (match) {
        setSelectedCategoryName(match.name);
      } else if (categoryInfo?.name) {
        setSelectedCategoryName(categoryInfo.name);
      }
    } else {
      setSelectedCategoryName(categoryInfo?.name ?? null);
    }
  }, [categories, selectedCategory, categoryInfo?.name]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['blogs', currentPage, debouncedSearch, selectedCategory],
    queryFn: () =>
      blogService.getBlogsWithPagination({
        limit: BLOGS_PER_PAGE,
        page: currentPage,
        search: debouncedSearch || undefined,
        categorySlug: selectedCategory || undefined,
      }),
    staleTime: 60_000,
  });

  const blogs = data?.blogs ?? [];
  const pagination = data?.pagination;

  const handleCategoryClick = (slug: string | null) => {
    setSelectedCategory((prev) => (prev === slug ? null : slug));
  };

  const hasActiveFilters = Boolean(selectedCategory || debouncedSearch);

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            {selectedCategoryName ? `${selectedCategoryName} Articles` : 'Our Blogs'}
          </h1>
          <p className="text-gray-600 text-lg max-w-3xl">
            {categoryInfo?.description
              ? categoryInfo.description
              : 'Insights, guides and stories from our community. Search and filter by category to discover more.'}
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]">
          <section>
            <div className="flex flex-col gap-6 mb-10">
              <div className="relative">
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search blogs..."
                  className="pl-10 pr-10 h-12 bg-white border-gray-200"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => setSearchInput('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm text-gray-600">Active filters:</span>
                  {selectedCategory && (
                    <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                      Category: {selectedCategoryName ?? selectedCategory}
                    </span>
                  )}
                  {debouncedSearch && (
                    <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                      Search: “{debouncedSearch}”
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory(null);
                      setSearchInput('');
                    }}
                    className="text-sm text-primary hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden border border-gray-200 bg-white">
                    <div className="h-56 bg-gray-200 animate-pulse" />
                    <div className="p-6 space-y-4">
                      <div className="h-4 w-1/3 bg-gray-200 animate-pulse rounded" />
                      <div className="h-6 w-2/3 bg-gray-200 animate-pulse rounded" />
                      <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
                      <div className="h-4 w-5/6 bg-gray-200 animate-pulse rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">Failed to load blogs. Please try again.</p>
              </div>
            ) : blogs.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                <p className="text-gray-500 mb-2">No blogs match your filters.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory(null);
                    setSearchInput('');
                  }}
                  className="text-primary hover:underline text-sm font-medium"
                >
                  Clear filters and view all posts
                </button>
              </div>
            ) : (
              <>
                {pagination && (
                  <div className="mb-6 text-sm text-gray-600">
                    Showing {(currentPage - 1) * BLOGS_PER_PAGE + 1} –{' '}
                    {Math.min(currentPage * BLOGS_PER_PAGE, pagination.total)} of {pagination.total} blogs
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  {blogs.map((blog) => (
                    <BlogCard key={blog.id} blog={blog} />
                  ))}
                </div>

                {pagination && pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>

                    {[...Array(pagination.totalPages)].map((_, i) => {
                      const pageNum = i + 1;
                      if (
                        pageNum === 1 ||
                        pageNum === pagination.totalPages ||
                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                              currentPage === pageNum ? 'bg-primary text-white' : 'border hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                      if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                        return (
                          <span key={pageNum} className="px-2 text-gray-400">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                      disabled={currentPage === pagination.totalPages}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </section>

          <aside className="space-y-6 hidden lg:block">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
                {categoriesLoading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handleCategoryClick(null)}
                  className={`text-left px-3 py-2 rounded-lg border transition-colors ${
                    selectedCategory === null
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-200 hover:border-primary/40 hover:bg-primary/5'
                  }`}
                >
                  All Articles
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleCategoryClick(category.slug)}
                    className={`text-left px-3 py-2 rounded-lg border transition-colors flex items-center justify-between ${
                      selectedCategory === category.slug
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-200 hover:border-primary/40 hover:bg-primary/5'
                    }`}
                  >
                    <span className="font-medium">{category.name}</span>
                    <span className="text-xs text-gray-500">{category.blogCount ?? 0}</span>
                  </button>
                ))}
                {!categoriesLoading && categories.length === 0 && (
                  <p className="text-sm text-gray-500">No categories yet.</p>
                )}
              </div>
            </div>
          </aside>
        </div>

        {/* Mobile categories */}
        <div className="mt-12 lg:hidden">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Categories</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            <button
              type="button"
              onClick={() => handleCategoryClick(null)}
              className={`flex-shrink-0 px-4 py-2 rounded-full border text-sm transition-colors ${
                selectedCategory === null
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-200 bg-white text-gray-700'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategoryClick(category.slug)}
                className={`flex-shrink-0 px-4 py-2 rounded-full border text-sm transition-colors ${
                  selectedCategory === category.slug
                    ? 'border-primary bg-primary text-white'
                    : 'border-gray-200 bg-white text-gray-700'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BlogsPage() {
  return <BlogsListing />;
}
