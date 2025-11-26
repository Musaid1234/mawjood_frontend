'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  cityService,
  City as CityType,
  Region as RegionType,
  Country as CountryType,
} from '@/services/city.service';
import { LocationSelection } from '@/store/cityStore';

interface LocationSelectorProps {
  cities: CityType[];
  regions: RegionType[];
  countries: CountryType[];
  selectedCity: CityType | null;
  selectedLocation: LocationSelection | null;
  loadingCities: boolean;
  onCitySelect: (cityId: string) => void;
  onRegionSelect: (region: RegionType) => void;
  onCountrySelect: (country: CountryType) => void;
}

export default function LocationSelector({
  cities,
  regions,
  countries,
  selectedCity,
  selectedLocation,
  loadingCities,
  onCitySelect,
  onRegionSelect,
  onCountrySelect,
}: LocationSelectorProps) {
  const { t } = useTranslation('common');
  const [showDropdown, setShowDropdown] = useState(false);
  const [locationTab, setLocationTab] = useState<'city' | 'region' | 'country'>('city');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<CityType[]>([]);
  const cityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cityRef.current && !cityRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch regions when dropdown opens
  useEffect(() => {
    if (showDropdown && !regions.length) {
      // Trigger parent to fetch regions
      // This will be handled in HeroSection
    }
  }, [showDropdown, regions.length]);

  useEffect(() => {
    if (!showDropdown) {
      if (selectedLocation?.type === 'region') {
        setLocationTab('region');
        return;
      }
      if (selectedLocation?.type === 'country') {
        setLocationTab('country');
        return;
      }
      setLocationTab('city');
    }
  }, [selectedLocation, showDropdown]);

  useEffect(() => {
    setSearchQuery('');
    setSearchResults([]);
  }, [locationTab]);

  useEffect(() => {
    if (!showDropdown || locationTab !== 'city') {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    const fetchCitySearch = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        setSearchLoading(false);
        return;
      }

      try {
        setSearchLoading(true);
        const result = await cityService.unifiedSearch(searchQuery.trim());
        setSearchResults(result.cities);
      } catch (error) {
        console.error('City unified search error:', error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchCitySearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, showDropdown, locationTab]);

  const handleCityClick = (cityId: string) => {
    onCitySelect(cityId);
    setShowDropdown(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRegionClick = (region: RegionType) => {
    onRegionSelect(region);
    setShowDropdown(false);
    setSearchQuery('');
    setSearchResults([]);
    setLocationTab('region');
  };

  const handleCountryClick = (country: CountryType) => {
    onCountrySelect(country);
    setShowDropdown(false);
    setSearchQuery('');
    setSearchResults([]);
    setLocationTab('country');
  };

  const getSelectedLocationName = () => {
    if (selectedLocation) return selectedLocation.name;
    if (selectedCity) return selectedCity.name;
    return '';
  };

  const displayCities = searchQuery.trim().length >= 2 ? searchResults : cities;

  const filteredRegions = useMemo(() => {
    if (!regions.length) return [];
    if (!searchQuery.trim()) return regions;
    const query = searchQuery.trim().toLowerCase();
    return regions.filter(
      (region) =>
        region.name.toLowerCase().includes(query) ||
        region.country?.name?.toLowerCase().includes(query)
    );
  }, [regions, searchQuery]);

  const filteredCountries = useMemo(() => {
    if (!countries.length) return [];
    if (!searchQuery.trim()) return countries;
    const query = searchQuery.trim().toLowerCase();
    return countries.filter((country) => country.name.toLowerCase().includes(query));
  }, [countries, searchQuery]);

  return (
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
        onClick={() => setShowDropdown(!showDropdown)}
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
          className={`w-5 h-5 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {showDropdown && !loadingCities && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 max-h-80 overflow-hidden">
          <div className="px-4 pt-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              {(['city', 'region', 'country'] as const).map((tab) => (
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
                    : tab === 'region'
                    ? t('hero.regionsTab', { defaultValue: 'States' })
                    : t('hero.countriesTab', { defaultValue: 'Countries' })}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 border-b border-gray-200">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                locationTab === 'city'
                  ? t('hero.searchCityPlaceholder', { defaultValue: 'Search city' })
                  : locationTab === 'region'
                  ? t('hero.searchRegionPlaceholder', { defaultValue: 'Search state' })
                  : t('hero.searchCountryPlaceholder', { defaultValue: 'Search country' })
              }
              className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="max-h-60 overflow-y-auto pb-10">
            {locationTab === 'city' ? (
              searchLoading ? (
                <div className="px-6 py-6 text-center text-gray-500">
                  {t('hero.loadingCities', { defaultValue: 'Searching cities...' })}
                </div>
              ) : displayCities.length > 0 ? (
                displayCities.map((city) => (
                  <div
                    key={city.id}
                    onClick={() => handleCityClick(city.id)}
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
                      searchQuery.trim().length >= 2
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
                    onClick={() => handleRegionClick(region)}
                    className={`px-6 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 ${
                      selectedLocation?.type === 'region' && selectedLocation.id === region.id
                        ? 'bg-primary/5'
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-gray-800">{region.name}</div>
                      {selectedLocation?.type === 'region' && selectedLocation.id === region.id && (
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
                      searchQuery.trim().length >= 2
                        ? 'No regions match your search'
                        : 'No regions available',
                  })}
                </div>
              )
            ) : filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <div
                  key={country.id}
                  onClick={() => handleCountryClick(country)}
                  className={`px-6 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 ${
                    selectedLocation?.type === 'country' && selectedLocation.id === country.id
                      ? 'bg-primary/5'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-gray-800">{country.name}</div>
                    {selectedLocation?.type === 'country' && selectedLocation.id === country.id && (
                      <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  {country.code && <div className="text-xs text-gray-500">{country.code}</div>}
                </div>
              ))
            ) : (
              <div className="px-6 py-6 text-center text-gray-500">
                {t('hero.noCountriesFound', {
                  defaultValue:
                    searchQuery.trim().length >= 2
                      ? 'No countries match your search'
                      : 'No countries available',
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}