'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { categoryService, Category } from '@/services/category.service';
import { businessService, Business } from '@/services/business.service';
import { cityService, City as CityType, Region as RegionType } from '@/services/city.service';
import { advertisementService, Advertisement } from '@/services/advertisement.service';
import { useCityStore } from '@/store/cityStore';
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

const formatSlugToName = (slug: string) =>
  slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export default function CityCategoryPage() {
  const params = useParams<{ city: string; category: string }>();
  const router = useRouter();
  const locationSlug = params.city;
  const categorySlug = params.category;

  const {
    cities,
    regions,
    selectedCity,
    selectedLocation,
    fetchCities,
    fetchRegions,
    setSelectedCity,
    setSelectedLocation,
  } = useCityStore();

  const [hydratedCity, setHydratedCity] = useState<CityType | null>(null);
  const [hydratedRegion, setHydratedRegion] = useState<RegionType | null>(null);
  const [locationType, setLocationType] = useState<'city' | 'region'>('city');
  const [category, setCategory] = useState<Category | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loadingCategory, setLoadingCategory] = useState(true);
  const [businessLoading, setBusinessLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [advertisement, setAdvertisement] = useState<Advertisement | null>(null);
  const [adLoading, setAdLoading] = useState(false);
  const [filters, setFilters] = useState<FiltersState>({
    search: '',
    rating: '',
    sortBy: 'popular',
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

  useEffect(() => {
    if (!cities.length) {
      fetchCities();
    }
  }, [cities.length, fetchCities]);

  useEffect(() => {
    if (!regions.length) {
      fetchRegions();
    }
  }, [regions.length, fetchRegions]);

  useEffect(() => {
    let cancelled = false;

    const resolveLocation = async () => {
      const normalizedSlug = locationSlug.toLowerCase();

      const cityMatch =
        cities.find((city) => city.slug.toLowerCase() === normalizedSlug) || null;

      if (cityMatch) {
        if (!cancelled) {
          setLocationType('city');
          setHydratedCity(cityMatch);
          setHydratedRegion(null);
          if (!selectedCity || selectedCity.id !== cityMatch.id) {
            setSelectedCity(cityMatch);
          }
          setSelectedLocation({
            type: 'city',
            slug: cityMatch.slug,
            name: cityMatch.name,
            id: cityMatch.id,
            regionId: cityMatch.regionId,
          });
        }
        return;
      }

      try {
        const remoteCity = await cityService.fetchCityBySlug(locationSlug);
        if (!cancelled && remoteCity) {
          setLocationType('city');
          setHydratedCity(remoteCity);
          setHydratedRegion(null);
          if (!selectedCity || selectedCity.id !== remoteCity.id) {
            setSelectedCity(remoteCity);
          }
          setSelectedLocation({
            type: 'city',
            slug: remoteCity.slug,
            name: remoteCity.name,
            id: remoteCity.id,
            regionId: remoteCity.regionId,
          });
          return;
        }
      } catch (err) {
        console.warn('City lookup failed, trying region/country', err);
      }

      let regionMatch =
        regions.find((region) => region.slug.toLowerCase() === normalizedSlug) || null;
      if (!regionMatch) {
        try {
          const fetchedRegions = await cityService.fetchRegions();
          regionMatch =
            fetchedRegions.find((region) => region.slug.toLowerCase() === normalizedSlug) || null;
        } catch (err) {
          console.error('Failed to fetch regions:', err);
        }
      }

      if (regionMatch) {
        const fallbackCity =
          cities.find((city) => city.regionId === regionMatch!.id) ||
          regionMatch.cities?.[0] ||
          null;

        if (!cancelled) {
          setLocationType('region');
          setHydratedRegion(regionMatch);
          setHydratedCity(fallbackCity || null);

          if (fallbackCity) {
            if (!selectedCity || selectedCity.id !== fallbackCity.id) {
              setSelectedCity(fallbackCity);
            }
          } else {
            setSelectedCity(null);
          }

          setSelectedLocation({
            type: 'region',
            slug: regionMatch.slug,
            name: regionMatch.name,
            id: regionMatch.id,
          });
        }
        return;
      }

      if (!cancelled) {
        setLocationType('city');
        setHydratedCity(null);
        setHydratedRegion(null);
      }
    };

    resolveLocation();

    return () => {
      cancelled = true;
    };
  }, [
    locationSlug,
    cities,
    regions,
    selectedCity,
    selectedLocation,
    setSelectedCity,
    setSelectedLocation,
  ]);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoadingCategory(true);
        const response = await categoryService.fetchCategoryBySlug(categorySlug);
        setCategory(response.data);
      } catch (err) {
        console.error('Failed to load category:', err);
        setError(err instanceof Error ? err.message : 'Failed to load category');
      } finally {
        setLoadingCategory(false);
      }
    };

    fetchCategory();
  }, [categorySlug]);

  const effectiveCity = useMemo(() => {
    if (hydratedCity) return hydratedCity;
    if (locationType === 'city' && selectedCity && selectedCity.slug.toLowerCase() === locationSlug.toLowerCase()) {
      return selectedCity;
    }
    if (locationType === 'region' && selectedCity) {
      return selectedCity;
    }
    return null;
  }, [hydratedCity, selectedCity, locationType, locationSlug]);

  const locationName = useMemo(() => {
    if (locationType === 'city') {
      return effectiveCity?.name || formatSlugToName(locationSlug);
    }
    if (locationType === 'region') {
      return hydratedRegion?.name || formatSlugToName(locationSlug);
    }
    return formatSlugToName(locationSlug);
  }, [locationType, effectiveCity, hydratedRegion, locationSlug]);

  const effectiveLocation = useMemo(() => {
    if (locationType === 'city' && effectiveCity) {
      return { id: effectiveCity.id, type: 'city' as const };
    }
    if (locationType === 'region' && hydratedRegion) {
      return { id: hydratedRegion.id, type: 'region' as const };
    }
    return null;
  }, [locationType, effectiveCity, hydratedRegion]);
  const effectiveLocationId = effectiveLocation?.id;
  const effectiveLocationType = effectiveLocation?.type;
  const canonicalPath = `/${locationSlug}/${categorySlug}`;
  const resolvedTargetUrl =
    advertisement?.targetUrl && advertisement.targetUrl.trim().length > 0
      ? advertisement.targetUrl.startsWith('http')
        ? advertisement.targetUrl
        : `/businesses/${advertisement.targetUrl.replace(/^\/+/, '')}`
      : null;

  useEffect(() => {
    if (!category) return;

    const existing = document.querySelector(
      'script[type="application/ld+json"][data-category-page]'
    );
    if (existing) existing.remove();

    if (typeof window === 'undefined') return;

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `Best ${category.name} in ${locationName}`,
      description: `Find the best ${category.name.toLowerCase()} businesses in ${locationName}. Browse verified listings, read reviews, and get contact information.`,
      url: `${window.location.origin}${canonicalPath}`,
      ...(category.description && { about: category.description }),
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: totalResults,
        itemListElement: businesses.slice(0, 10).map((business, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'LocalBusiness',
            name: business.name,
            url: `${window.location.origin}/businesses/${business.slug}`,
            ...(business.address && {
              address: {
                '@type': 'PostalAddress',
                streetAddress: business.address,
                addressLocality: locationName,
              },
            }),
            ...(business.phone && { telephone: business.phone }),
            ...(business.email && { email: business.email }),
            ...(business.averageRating && {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: business.averageRating,
                reviewCount: business.totalReviews || 0,
              },
            }),
          },
        })),
      },
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-category-page', 'true');
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.querySelector(
        'script[type="application/ld+json"][data-category-page]'
      );
      if (scriptToRemove) scriptToRemove.remove();
    };
  }, [category, locationName, canonicalPath, businesses, totalResults]);

  useEffect(() => {
    if (!category) return;
    if (category.subcategories && category.subcategories.length > 0) return;

    const fetchBusinesses = async () => {
      try {
        setBusinessLoading(true);

        const response = await businessService.searchBusinesses({
          categoryIds: [category.id],
          locationId: effectiveLocationId,
          locationType: effectiveLocationType,
          page: currentPage,
          limit: 20,
          search: filters.search.trim().length ? filters.search.trim() : undefined,
          rating: filters.rating ? Number(filters.rating) : undefined,
          sortBy: filters.sortBy,
        });

        setBusinesses(response.businesses || []);
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

    fetchBusinesses();
  }, [category, currentPage, effectiveLocationId, effectiveLocationType, filters]);

  useEffect(() => {
    if (!category) return;

    const loadAdvertisement = async () => {
      try {
        setAdLoading(true);
        const ad = await advertisementService.getDisplayAdvertisement({
          categoryId: category.id,
          locationId: effectiveLocationId ?? undefined,
          locationType: effectiveLocationType,
        });
        setAdvertisement(ad);
      } catch (err) {
        console.error('Failed to fetch advertisement:', err);
        setAdvertisement(null);
      } finally {
        setAdLoading(false);
      }
    };

    loadAdvertisement();
  }, [category, effectiveLocationId, effectiveLocationType]);

  useEffect(() => {
    if (loadingCategory) return;
    if (error) return;
    if (locationType !== 'city') return;
    if (!effectiveCity && cities.length) {
      const defaultCity = cities.find((city) =>
        city.name.toLowerCase().includes('riyadh')
      ) || cities[0];

      if (defaultCity) {
        router.replace(`/${defaultCity.slug}/${categorySlug}`);
      }
    }
  }, [effectiveCity, cities, categorySlug, router, loadingCategory, error, locationType]);

  if (loadingCategory) {
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
          <Link href="/" className="bg-primary text-white px-6 py-3 rounded-lg">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (category.subcategories && category.subcategories.length > 0) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <nav className="flex mb-6 text-sm">
            <Link href="/" className="text-gray-500 hover:text-primary">
              {locationName}
            </Link>
            <span className="mx-2">&gt;</span>
            <span className="text-gray-800">{category.name}</span>
          </nav>

          <h1 className="text-3xl font-bold mb-8">
            Popular {category.name} in {locationName}
          </h1>

          <div className="bg-white rounded-2xl shadow-sm divide-y">
            {category.subcategories.map((sub) => (
              <Link
                key={sub.id}
                href={`/${locationSlug}/${sub.slug}`}
                className="flex items-center justify-between p-6 hover:bg-gray-50 group"
              >
                <h3 className="text-lg font-medium group-hover:text-primary">{sub.name}</h3>
                <svg
                  className="w-6 h-6 text-gray-400 group-hover:text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
      <div className="space-y-6 mb-4">
          {adLoading && (
            <div/>
          )}
          {!adLoading && advertisement && (
            <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
              {resolvedTargetUrl ? (
                <Link href={resolvedTargetUrl} target="_blank" rel="noopener noreferrer">
                  <Image
                    src={advertisement.imageUrl}
                    alt={advertisement.title}
                    width={1200}
                    height={360}
                    className="w-full h-46 object-cover"
                    priority  
                  />
                </Link>
              ) : (
                <Image
                  src={advertisement.imageUrl}
                  alt={advertisement.title}
                  width={1200}
                  height={360}
                  className="w-full h-62 object-cover"
                  priority
                />
              )}
            </div>
          )}
        </div>
        <nav className="flex mb-3 text-sm">
          <Link href="/" className="text-gray-500 hover:text-primary">
            {locationName}
          </Link>
          <span className="mx-1.5">&gt;</span>
          <span className="text-gray-800">{category.name}</span>
          <span className="mx-1.5">&gt;</span>
          <span>{totalResults} Listings</span>
        </nav>

        <h1 className="text-3xl font-bold mb-8">
          Popular {category.name} in {locationName}
        </h1>

        <div className="bg-white rounded-xl p-4 mb-6 space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <form
              onSubmit={handleSearchSubmit}
              className="flex w-full md:max-w-md gap-2"
            >
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={`Search within ${category.name.toLowerCase()}`}
                style={{ paddingTop: '0.875rem', paddingBottom: '0.875rem' }}
                className="flex-1 px-4 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
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
                value={filters.rating}
                onChange={(event) => updateFilters({ rating: event.target.value })}
                style={{ paddingTop: '0.875rem', paddingBottom: '0.875rem' }}
                className="px-4 border border-gray-300 rounded-lg text-sm bg-white text-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Rating Filter</option>
                <option value="5">5 Stars</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
              </select>

              <select
                value={filters.sortBy}
                onChange={(event) => updateFilters({ sortBy: event.target.value })}
                style={{ paddingTop: '0.875rem', paddingBottom: '0.875rem' }}
                className="px-4 border border-gray-300 rounded-lg text-sm bg-white text-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600">
            {filters.search && (
              <span className="text-xs text-gray-500">
                Filtered by search term “{filters.search}”
              </span>
            )}
          </div>
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
              <BusinessListCard key={business.id} business={business} />
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