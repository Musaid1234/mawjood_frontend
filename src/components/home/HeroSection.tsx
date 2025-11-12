'use client';

import { useTranslation } from 'react-i18next';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCityStore } from '@/store/cityStore';
import { businessService, SearchResult } from '@/services/business.service';
import { cityService, City as CityType, Region as RegionType } from '@/services/city.service';
import { useSiteSettings } from '@/hooks/useSiteSettings';

interface HeroCard {
  id: string;
  title: string;
  buttonText: string;
  buttonColor: string;
  bgImage: string;
  slug: string;
}

export default function HeroSection() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const {
    cities,
    regions,
    selectedCity,
    selectedLocation,
    loading: loadingCities,
    fetchCities,
    fetchRegions,
    setSelectedCity,
    setSelectedLocation,
  } = useCityStore();

  const { data: siteSettings } = useSiteSettings();

  const heroSettings = siteSettings?.hero;
  const heroTitle = heroSettings?.title ?? t('hero.title');
  const heroSubtitle = heroSettings?.subtitle;

  const defaultCategoryCards: HeroCard[] = useMemo(
    () => [
      {
        id: 'packers-movers',
        title: t('hero.packersMovers'),
        buttonText: t('hero.getBestDeal'),
        bgImage: '/home/packers.jpg',
        buttonColor: 'bg-orange-500 hover:bg-orange-600',
        slug: 'transporters',
      },
      {
        id: 'repairs-services',
        title: t('hero.repairsServices'),
        buttonText: t('hero.bookNow'),
        bgImage: '/home/b2b.jpg',
        buttonColor: 'bg-blue-500 hover:bg-blue-600',
        slug: 'repairs',
      },
      {
        id: 'real-estate',
        title: t('hero.realEstate'),
        buttonText: t('hero.explore'),
        bgImage: '/home/real-estate.jpg',
        buttonColor: 'bg-purple-500 hover:bg-purple-600',
        slug: 'real-estate',
      },
      {
        id: 'doctors',
        title: t('hero.doctors'),
        buttonText: t('hero.bookNow'),
        bgImage: '/home/doctors.jpg',
        buttonColor: 'bg-green-500 hover:bg-green-600',
        slug: 'healthcare',
      },
    ],
    [t]
  );

  const categoryCards = useMemo<HeroCard[]>(() => {
    if (heroSettings?.cards?.length) {
      return heroSettings.cards.map((card) => ({
        id: card.id,
        title: card.title,
        buttonText: card.buttonText ?? t('hero.explore'),
        buttonColor: card.buttonColor ?? 'bg-primary hover:bg-primary/90',
        bgImage: card.image ?? '/home/placeholder.jpg',
        slug: card.slug,
      }));
    }
    return defaultCategoryCards;
  }, [heroSettings?.cards, defaultCategoryCards, t]);

  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<{ categories: SearchResult[]; businesses: SearchResult[] }>({
    categories: [],
    businesses: []
  });
  const [searchLoading, setSearchLoading] = useState(false);
  const [locationTab, setLocationTab] = useState<'city' | 'region'>('city');
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [citySearchLoading, setCitySearchLoading] = useState(false);
  const [citySearchResults, setCitySearchResults] = useState<CityType[]>([]);
  const [geoAttempted, setGeoAttempted] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  useEffect(() => {
    if (!geoAttempted) return;
    if (!cities.length) return;
    if (selectedLocation && selectedLocation.type !== 'city') return;
    if (selectedCity) return;

    const riyadh = cities.find((city) =>
      city.name.toLowerCase().includes('riyadh') || city.name.toLowerCase().includes('الرياض')
    );
    if (riyadh) {
      setSelectedCity(riyadh);
      return;
    }
    if (cities[0]) {
      setSelectedCity(cities[0]);
    }
  }, [cities, selectedCity, selectedLocation, setSelectedCity, geoAttempted]);

  useEffect(() => {
    if (
      selectedCity &&
      (!selectedLocation ||
        (selectedLocation.type === 'city' && selectedLocation.id !== selectedCity.id))
    ) {
      setSelectedLocation({
        type: 'city',
        slug: selectedCity.slug,
        name: selectedCity.name,
        id: selectedCity.id,
        regionId: selectedCity.regionId,
      });
    }
  }, [selectedCity, selectedLocation, setSelectedLocation]);

  useEffect(() => {
    if (!showCityDropdown) {
      if (selectedLocation?.type === 'region') {
        setLocationTab('region');
      } else {
        setLocationTab('city');
      }
    }
  }, [selectedLocation, showCityDropdown]);

  useEffect(() => {
    setLocationSearchQuery('');
    setCitySearchResults([]);
  }, [locationTab]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (cityRef.current && !cityRef.current.contains(event.target as Node)) {
        setShowCityDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length < 2) {
        setSuggestions({ categories: [], businesses: [] });
        return;
      }

      try {
        setSearchLoading(true);
        const cityId = selectedCity?.id || '';
        const results = await businessService.unifiedSearch(searchQuery, cityId, 5);
        setSuggestions({
          categories: results.categories,
          businesses: results.businesses
        });
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions({ categories: [], businesses: [] });
      } finally {
        setSearchLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedCity]);

  useEffect(() => {
    if (!showCityDropdown) {
      setLocationSearchQuery('');
      setCitySearchResults([]);
      setCitySearchLoading(false);
      return;
    }

    if (locationTab !== 'city') {
      setCitySearchResults([]);
      setCitySearchLoading(false);
      return;
    }

    const fetchCitySearch = async () => {
      if (locationSearchQuery.trim().length < 2) {
        setCitySearchResults([]);
        setCitySearchLoading(false);
        return;
      }

      try {
        setCitySearchLoading(true);
        const result = await cityService.unifiedSearch(locationSearchQuery.trim());
        setCitySearchResults(result.cities);
      } catch (error) {
        console.error('City unified search error:', error);
        setCitySearchResults([]);
      } finally {
        setCitySearchLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchCitySearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [locationSearchQuery, showCityDropdown, locationTab]);

useEffect(() => {
  if (!showCityDropdown) return;

  if (!regions.length) {
    fetchRegions();
  }
}, [showCityDropdown, regions.length, fetchRegions]);

  useEffect(() => {
    const trySelectDefault = () => {
      const riyadh = cities.find((city) =>
        city.name.toLowerCase().includes('riyadh') || city.name.toLowerCase().includes('الرياض')
      );
      if (riyadh) {
        setSelectedCity(riyadh);
        return;
      }
      if (cities[0]) {
        setSelectedCity(cities[0]);
      }
    };

    const matchCityByName = (name?: string): CityType | undefined => {
      if (!name) return undefined;
      const normalized = name.toLowerCase();
      return (
        cities.find((city) => city.name.toLowerCase() === normalized) ||
        cities.find((city) => city.slug.toLowerCase() === normalized) ||
        cities.find((city) => city.name.toLowerCase().includes(normalized))
      );
    };

    const matchCityByRegionName = (name?: string): CityType | undefined => {
      if (!name) return undefined;
      const normalized = name.toLowerCase();
      return cities.find((city) => city.region?.name?.toLowerCase() === normalized);
    };

    const matchCityByCountryName = (name?: string): CityType | undefined => {
      if (!name) return undefined;
      const normalized = name.toLowerCase();
      return cities.find((city) => city.region?.country?.name?.toLowerCase() === normalized);
    };

    const fetchCityFromUnified = async (term: string): Promise<CityType | undefined> => {
      try {
        const result = await cityService.unifiedSearch(term);
        if (result.cities.length > 0) {
          return result.cities[0];
        }
        if (result.regions.length > 0) {
          const regionMatch = cities.find((city) => city.region?.id === result.regions[0].id);
          if (regionMatch) return regionMatch;
        }
        if (result.countries.length > 0) {
          const countryMatch = cities.find(
            (city) => city.region?.country?.id === result.countries[0].id
          );
          if (countryMatch) return countryMatch;
        }
      } catch (error) {
        console.error('Unified location search error:', error);
      }
      return undefined;
    };

    const selectCityFromAddress = async (address: any) => {
      const possibleCityNames = [
        address?.city,
        address?.town,
        address?.village,
        address?.municipality,
        address?.county,
        address?.state_district,
      ];
      const possibleRegionNames = [address?.state, address?.region, address?.province];
      const possibleCountryNames = [address?.country];

      let match: CityType | undefined;

      for (const name of possibleCityNames) {
        match = matchCityByName(name);
        if (match) break;
      }

      if (!match) {
        for (const name of possibleCityNames) {
          if (!name) continue;
          match = await fetchCityFromUnified(name);
          if (match) break;
        }
      }

      if (!match) {
        for (const name of possibleRegionNames) {
          match = matchCityByRegionName(name);
          if (match) break;
        }
      }

      if (!match) {
        for (const name of possibleRegionNames) {
          if (!name) continue;
          match = await fetchCityFromUnified(name);
          if (match) break;
        }
      }

      if (!match) {
        for (const name of possibleCountryNames) {
          match = matchCityByCountryName(name);
          if (match) break;
        }
      }

      if (!match) {
        for (const name of possibleCountryNames) {
          if (!name) continue;
          match = await fetchCityFromUnified(name);
          if (match) break;
        }
      }

      if (match) {
        setSelectedCity(match);
      } else {
        trySelectDefault();
      }
    };

    const isDefaultSelection =
      !selectedLocation ||
      (selectedLocation.type === 'city' &&
        (selectedLocation.name.toLowerCase().includes('riyadh') ||
          selectedLocation.name.toLowerCase().includes('الرياض')));

    if (typeof window === 'undefined' || geoAttempted || geoLoading || !cities.length) {
      return;
    }

    if (!isDefaultSelection) {
      setGeoAttempted(true);
      return;
    }

    if (!navigator.geolocation) {
      setGeoAttempted(true);
      trySelectDefault();
      return;
    }

    setGeoAttempted(true);
    setGeoLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          if (!response.ok) {
            throw new Error('Failed to reverse geocode location');
          }

          const data = await response.json();
          await selectCityFromAddress(data?.address);
        } catch (error) {
          console.error('Geolocation lookup error:', error);
          trySelectDefault();
        } finally {
          setGeoLoading(false);
        }
      },
      (error) => {
        console.warn('Geolocation permission denied or unavailable:', error);
        setGeoLoading(false);
        trySelectDefault();
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 5 * 60 * 1000,
      }
    );
  }, [cities, selectedCity, selectedLocation, geoAttempted, geoLoading, setSelectedCity]);

  const handleSearch = (slug?: string, type?: 'category' | 'business') => {
    if (slug && type) {
      // Navigate to specific category or business
      if (type === 'category') {
        const locationSlug = routingLocationSlug;
        router.push(`/${locationSlug}/${slug}`);
      } else {
        router.push(`/businesses/${slug}`);
      }
      setShowSuggestions(false);
      return;
    }

    // General search
    if (!searchQuery && !selectedCity?.id) {
      router.push('/businesses');
      return;
    }

    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCity?.id) params.set('cityId', selectedCity.id);
    router.push(`/businesses?${params.toString()}`);
    setShowSuggestions(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleCitySelect = (cityId: string) => {
    const city =
      cities.find((c) => c.id === cityId) ||
      citySearchResults.find((c) => c.id === cityId);
    if (city) {
      setSelectedCity(city);
      setSelectedLocation({
        type: 'city',
        slug: city.slug,
        name: city.name,
        id: city.id,
        regionId: city.regionId,
      });
    }
    setShowCityDropdown(false);
    setLocationSearchQuery('');
    setCitySearchResults([]);
  };

  const handleRegionSelect = (region: RegionType) => {
    const fallbackCity =
      cities.find((city) => city.regionId === region.id) ||
      region.cities?.[0] ||
      null;

    if (fallbackCity) {
      setSelectedCity(fallbackCity);
    } else {
      setSelectedCity(null);
    }

    setSelectedLocation({
      type: 'region',
      slug: region.slug,
      name: region.name,
      id: region.id,
    });

    setShowCityDropdown(false);
    setLocationSearchQuery('');
    setCitySearchResults([]);
    setLocationTab('region');
  };

  const getSelectedLocationName = () => {
    if (selectedLocation) return selectedLocation.name;
    if (selectedCity) return selectedCity.name;
    return '';
  };

  const totalSuggestions = suggestions.categories.length + suggestions.businesses.length;

  const routingLocationSlug = useMemo(() => {
    if (selectedLocation?.slug) return selectedLocation.slug;
    if (selectedCity?.slug) return selectedCity.slug;
    const riyadh = cities.find((city) =>
      city.name.toLowerCase().includes('riyadh') || city.name.toLowerCase().includes('الرياض')
    );
    if (riyadh?.slug) return riyadh.slug;
    if (cities[0]?.slug) return cities[0].slug;
    return 'riyadh';
  }, [selectedLocation, selectedCity, cities]);
  const displayCities =
    locationSearchQuery.trim().length >= 2 ? citySearchResults : cities;

  const filteredRegions = useMemo(() => {
    if (!regions.length) return [];
    if (!locationSearchQuery.trim()) return regions;
    const query = locationSearchQuery.trim().toLowerCase();
    return regions.filter(
      (region) =>
        region.name.toLowerCase().includes(query) ||
        region.country?.name?.toLowerCase().includes(query)
    );
  }, [regions, locationSearchQuery]);

  return (
    <section className="bg-gradient-to-r from-green-50 to-green-200 min-h-screen flex flex-col py-8 px-4 sm:px-6 lg:px-8">
      {/* Outer container for centering title + search */}
      <div className="max-w-7xl mx-auto flex-1 flex flex-col justify-center w-full">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2 text-center leading-tight">
          {heroTitle}
        </h1>
        {heroSubtitle && (
          <p className="text-center text-gray-600 mb-6 max-w-3xl mx-auto">
            {heroSubtitle}
          </p>
        )}
  
        <div className="w-full max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl p-3 mb-12 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-3 w-full">
            <div className="flex-1 relative" ref={searchRef}>
              <input
                type="text"
                placeholder={t('hero.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(e.target.value.length >= 2);
                }}
                onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                onKeyPress={handleKeyPress}
                className="w-full px-6 py-4 text-lg border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-gray-50"
              />
  
              {showSuggestions && searchQuery.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                  {searchLoading ? (
                    <div className="px-6 py-4 text-center text-gray-500">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                    </div>
                  ) : totalSuggestions > 0 ? (
                    <>
                      {suggestions.categories.length > 0 && (
                        <div>
                          <div className="px-6 py-2 bg-gray-50 border-b border-gray-100">
                            <span className="text-xs font-semibold text-gray-500 uppercase">Categories</span>
                          </div>
                          {suggestions.categories.map((item) => (
                            <div
                              key={`cat-${item.id}`}
                              onClick={() => handleSearch(item.slug, 'category')}
                              className="px-6 py-3 hover:bg-gray-50 cursor-pointer transition-colors flex items-center gap-3 border-b border-gray-100"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-800 truncate">{item.name}</div>
                                {item.description && (
                                  <div className="text-xs text-gray-500 truncate">{item.description}</div>
                                )}
                              </div>
                              <svg
                                className="w-5 h-5 text-gray-400 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          ))}
                        </div>
                      )}
  
                      {suggestions.businesses.length > 0 && (
                        <div>
                          <div className="px-6 py-2 bg-gray-50 border-b border-gray-100">
                            <span className="text-xs font-semibold text-gray-500 uppercase">Businesses</span>
                          </div>
                          {suggestions.businesses.map((item) => (
                            <div
                              key={`bus-${item.id}`}
                              onClick={() => handleSearch(item.slug, 'business')}
                              className="px-6 py-3 hover:bg-gray-50 cursor-pointer transition-colors flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-gray-800 truncate">{item.name}</span>
                                  {item.isVerified && <span className="text-green-500 text-xs">✓</span>}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <span>{item.category?.name}</span>
                                  {item.city?.name && (
                                    <>
                                      <span>•</span>
                                      <span>{item.city.name}</span>
                                    </>
                                  )}
                                  {item.averageRating && item.averageRating > 0 && (
                                    <>
                                      <span>•</span>
                                      <span className="flex items-center gap-1">
                                        <span>⭐</span>
                                        <span>{item.averageRating.toFixed(1)}</span>
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <svg
                                className="w-5 h-5 text-gray-400 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="px-6 py-8 text-center text-gray-500">
                      No results found for &quot;{searchQuery}&quot;
                    </div>
                  )}
                </div>
              )}
            </div>
  
            <div className="flex-1 relative" ref={cityRef}>
              <div className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none z-10">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
  
              <button
                type="button"
                onClick={() => setShowCityDropdown(!showCityDropdown)}
                disabled={loadingCities}
                className="w-full pl-12 pr-10 py-4 text-lg border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-gray-50 text-left"
              >
                {loadingCities ? (
                  <span className="text-gray-400">Loading locations...</span>
                ) : getSelectedLocationName() ? (
                  <span className="text-gray-800">{getSelectedLocationName()}</span>
                ) : (
                  <span className="text-gray-400">{t('hero.locationPlaceholder')}</span>
                )}
              </button>
  
              <div className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
                <svg
                  className={`w-5 h-5 transition-transform ${showCityDropdown ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
  
              {showCityDropdown && !loadingCities && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 max-h-80 overflow-hidden">
                  <div className="px-4 pt-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      {(['city', 'region'] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setLocationTab(tab)}
                          className={`px-3 py-1 rounded-full border ${
                            locationTab === tab
                              ? 'bg-primary text-white border-primary'
                              : 'text-gray-600 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {tab === 'city'
                            ? t('hero.citiesTab', { defaultValue: 'Cities' })
                            : t('hero.regionsTab', { defaultValue: 'States' })}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 border-b border-gray-200">
                    <input
                      type="text"
                      value={locationSearchQuery}
                      onChange={(e) => setLocationSearchQuery(e.target.value)}
                      placeholder={
                        locationTab === 'city'
                          ? t('hero.searchCityPlaceholder', { defaultValue: 'Search city' })
                          : locationTab === 'region'
                          ? t('hero.searchRegionPlaceholder', { defaultValue: 'Search region' })
                          : t('hero.searchCountryPlaceholder', { defaultValue: 'Search country' })
                      }
                      className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {locationTab === 'city' ? (
                      citySearchLoading ? (
                        <div className="px-6 py-6 text-center text-gray-500">
                          {t('hero.loadingCities', { defaultValue: 'Searching cities...' })}
                        </div>
                      ) : displayCities.length > 0 ? (
                        displayCities.map((city) => (
                    <div
                      key={city.id}
                      onClick={() => handleCitySelect(city.id)}
                      className={`px-6 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 ${
                              selectedLocation?.type === 'city' && selectedLocation.id === city.id
                                ? 'bg-primary/5'
                                : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-gray-800">{city.name}</div>
                              {selectedLocation?.type === 'city' && selectedLocation.id === city.id && (
                                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </div>
                            {city.region?.name && (
                              <div className="text-xs text-gray-500">
                                {city.region.name}
                                {city.region.country?.name ? ` • ${city.region.country.name}` : ''}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="px-6 py-6 text-center text-gray-500">
                          {t('hero.noCitiesFound', {
                            defaultValue:
                              locationSearchQuery.trim().length >= 2
                                ? 'No cities match your search'
                                : 'No cities available',
                          })}
                        </div>
                      )
                    ) : locationTab === 'region' ? (
                      filteredRegions.length > 0 ? (
                        filteredRegions.map((region) => (
                          <div
                            key={region.id}
                            onClick={() => handleRegionSelect(region)}
                            className={`px-6 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 ${
                              selectedLocation?.type === 'region' && selectedLocation.id === region.id
                                ? 'bg-primary/5'
                                : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="font-medium text-gray-800">{region.name}</div>
                              {selectedLocation?.type === 'region' &&
                                selectedLocation.id === region.id && (
                                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                )}
                            </div>
                            {region.country?.name && (
                              <div className="text-xs text-gray-500">{region.country.name}</div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="px-6 py-6 text-center text-gray-500">
                          {t('hero.noRegionsFound', {
                            defaultValue:
                              locationSearchQuery.trim().length >= 2
                                ? 'No regions match your search'
                                : 'No regions available',
                          })}
                        </div>
                      )
                    ) : null}
                  </div>
                </div>
              )}
            </div>
  
            <button
              onClick={() => handleSearch()}
              className="bg-primary text-white px-6 py-4 rounded-2xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 md:w-40 w-full"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
  
      <div className="max-w-7xl mx-auto pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          {categoryCards.map((card) => (
            <div
              key={card.id}
              onClick={() => router.push(`/${routingLocationSlug}/${card.slug}`)}
              className="bg-blue-100 rounded-xl overflow-hidden shadow-lg transition-all duration-300 transform flex h-40 cursor-pointer hover:scale-105"
            >
              <div className="flex-1 p-6 flex flex-col justify-between">
                <h3 className="text-md font-bold text-gray-800 mb-3">{card.title}</h3>
                <button
                  className={`${card.buttonColor} text-white font-bold py-2 px-4 rounded-sm hover:opacity-90 transition-all duration-300 text-xs uppercase tracking-wide w-fit`}
                >
                  {card.buttonText}
                </button>
              </div>
              <div className="w-32 relative">
                <Image src={card.bgImage} alt={card.title} fill className="object-cover" sizes="128px" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}