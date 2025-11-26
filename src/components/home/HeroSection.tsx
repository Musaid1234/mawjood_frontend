'use client';

import { useTranslation } from 'react-i18next';
import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCityStore } from '@/store/cityStore';
import { Country, Region } from '@/services/city.service';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useGeolocation } from '@/hooks/useGeolocation';
import SearchBar from '@/components/home/hero/Searchbar';
import LocationSelector from '@/components/home/hero/Locationselector';
import HeroCategoryCards from '@/components/home/hero/Herocategorycards';

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
    countries,
    selectedCity,
    selectedLocation,
    loading: loadingCities,
    fetchCities,
    fetchRegions,
    fetchCountries,
    setSelectedCity,
    setSelectedLocation,
    isUserSelectionLocked,
    lockUserSelection,
  } = useCityStore();

  const { data: siteSettings, isLoading: siteSettingsLoading } = useSiteSettings();

  // Initialize geolocation
  useGeolocation({
    cities,
    selectedCity,
    selectedLocation,
    setSelectedCity,
    isUserSelectionLocked,
  });

  // Hero settings from site settings
  const heroSettings = siteSettings?.hero;
  const heroTitle = useMemo(() => {
    if (siteSettingsLoading) return '';
    return heroSettings?.title ?? t('hero.title');
  }, [heroSettings?.title, siteSettingsLoading, t]);

  const heroSubtitle = useMemo(() => {
    if (siteSettingsLoading) return '';
    return heroSettings?.subtitle ?? '';
  }, [heroSettings?.subtitle, siteSettingsLoading]);

  // Default category cards
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

  // Category cards from settings or defaults
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

  // Location slug for routing
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

  // Fetch cities on mount
  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  // Fetch regions when needed (handled by location selector opening)
  useEffect(() => {
    if (!regions.length) {
      fetchRegions();
    }
  }, [regions.length, fetchRegions]);

  useEffect(() => {
    if (!countries.length) {
      fetchCountries();
    }
  }, [countries.length, fetchCountries]);

  // Sync selected city with location
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

  // Handle search
  const handleSearch = (slug?: string, type?: 'category' | 'business') => {
    if (slug && type) {
      if (type === 'category') {
        router.push(`/${routingLocationSlug}/${slug}`);
      } else {
        router.push(`/businesses/${slug}`);
      }
      return;
    }

    // General search - redirect to businesses page
    router.push('/businesses');
  };

  // Handle city selection
  const handleCitySelect = (cityId: string) => {
    const city = cities.find((c) => c.id === cityId);
    if (city) {
      setSelectedCity(city);
      setSelectedLocation({
        type: 'city',
        slug: city.slug,
        name: city.name,
        id: city.id,
        regionId: city.regionId,
      });
      lockUserSelection();
    }
  };

  // Handle region selection
  const handleRegionSelect = (region: Region) => {
    const fallbackCity =
      cities.find((city) => city.regionId === region.id) ||
      region.cities?.[0] ||
      null;

    if (fallbackCity) {
      setSelectedCity(fallbackCity);
    }

    setSelectedLocation({
      type: 'region',
      slug: region.slug,
      name: region.name,
      id: region.id,
    });
    lockUserSelection();

    // Fetch regions if not already loaded
    if (!regions.length) {
      fetchRegions();
    }
  };

  const handleCountrySelect = (country: Country) => {
    const fallbackCity =
      cities.find((city) => {
        if (city.region?.country?.id) {
          return city.region.country.id === country.id;
        }
        const regionMatch = regions.find((region) => region.id === city.regionId);
        return regionMatch?.countryId === country.id;
      }) || null;

    if (fallbackCity) {
      setSelectedCity(fallbackCity);
    }

    setSelectedLocation({
      type: 'country',
      slug: country.slug,
      name: country.name,
      id: country.id,
    });
    lockUserSelection();

    if (!countries.length) {
      fetchCountries();
    }
  };

  return (
    <section className="bg-gradient-to-r from-green-50 to-green-200 min-h-screen flex flex-col py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex-1 flex flex-col justify-center w-full">
        {/* Hero Title */}
        {siteSettingsLoading ? (
          <div className="mb-8 flex flex-col items-center gap-4 animate-pulse">
            <div className="h-10 w-full max-w-2xl rounded-full bg-gray-200" />
            <div className="h-4 w-full max-w-xl rounded-full bg-gray-200" />
          </div>
        ) : (
          <>
            {heroTitle && (
              <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2 text-center leading-tight">
                {heroTitle}
              </h1>
            )}
            {heroSubtitle && (
              <p className="text-center text-gray-600 mb-6 max-w-3xl mx-auto">
                {heroSubtitle}
              </p>
            )}
          </>
        )}

        {/* Search Bar */}
        <div className="w-full max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl p-3 mb-12 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-3 w-full">
            <SearchBar 
              onSearch={handleSearch} 
              selectedCityId={selectedCity?.id}
            />

            <LocationSelector
              cities={cities}
              regions={regions}
              countries={countries}
              selectedCity={selectedCity}
              selectedLocation={selectedLocation}
              loadingCities={loadingCities}
              onCitySelect={handleCitySelect}
              onRegionSelect={handleRegionSelect}
              onCountrySelect={handleCountrySelect}
            />

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

      <div className="max-w-7xl mx-auto pb-12 w-full">
        <HeroCategoryCards
          cards={categoryCards}
          locationSlug={routingLocationSlug}
          loading={siteSettingsLoading}
        />
      </div>
    </section>
  );
}