import { useFormikContext } from 'formik';
import { MapPin, ChevronDown, ChevronUp, Search, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cityService, type Country, type Region, type City } from '@/services/city.service';

type Option = {
  value: string;
  label: string;
  description?: string;
};

interface SearchableSelectProps {
  name: string;
  label: string;
  placeholder: string;
  options: Option[];
  value: string;
  onSelect: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  helperText?: string;
}

function SearchableSelect({
  name,
  label,
  placeholder,
  options,
  value,
  onSelect,
  error,
  required,
  disabled,
  isLoading,
  helperText,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    const lowered = searchQuery.toLowerCase();
    return options.filter((option) => option.label.toLowerCase().includes(lowered));
  }, [options, searchQuery]);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionSelect = (optionValue: string) => {
    onSelect(optionValue);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={`${name}-options`}
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => !prev);
          }
        }}
        disabled={disabled}
        className={`w-full px-4 py-3 border rounded-lg flex items-center justify-between transition-colors ${
          error
            ? 'border-red-500'
            : disabled
              ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'border-gray-300 focus:ring-2 focus:ring-[#1c4233] focus:border-transparent'
        }`}
      >
        <span
          className={`truncate ${
            selectedOption ? 'text-gray-900' : 'text-gray-500'
          }`}
        >
          {selectedOption ? selectedOption.label : isLoading ? 'Loading...' : placeholder}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {helperText ? (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      ) : null}

      {isOpen && !disabled && (
        <div
          id={`${name}-options`}
          role="listbox"
          className="absolute z-20 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-72 overflow-hidden"
        >
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1c4233]"
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">No results found</div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  onClick={() => handleOptionSelect(option.value)}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${
                    option.value === value ? 'bg-[#1c4233]/10 text-[#1c4233] font-medium' : 'text-gray-900'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="truncate">{option.label}</span>
                    {option.description ? (
                      <span className="text-xs text-gray-500 truncate">{option.description}</span>
                    ) : null}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

export default function LocationSection() {
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFieldValue,
    setFieldTouched,
    setFieldError,
    validateField,
  } = useFormikContext<any>();
  const [showCoordinates, setShowCoordinates] = useState(false);

  const {
    data: countriesResponse,
    isLoading: isCountriesLoading,
    isError: isCountriesError,
  } = useQuery({
    queryKey: ['countries-with-regions'],
    queryFn: () => cityService.fetchCountries(),
  });

  const countries: Country[] = countriesResponse ?? [];

  const selectedCountry = useMemo(() => {
    if (!values.countryId) return undefined;
    return countries.find((country) => country.id === values.countryId);
  }, [countries, values.countryId]);

  const availableRegions: Region[] = useMemo(() => {
    return selectedCountry?.regions ?? [];
  }, [selectedCountry]);

  const selectedRegion = useMemo(() => {
    if (!values.regionId) return undefined;
    return availableRegions.find((region) => region.id === values.regionId);
  }, [availableRegions, values.regionId]);

  const availableCities: City[] = useMemo(() => {
    return selectedRegion?.cities ?? [];
  }, [selectedRegion]);

  // Auto-populate country and region when city is already selected (e.g., editing state)
  useEffect(() => {
    if (!values.cityId || countries.length === 0) {
      return;
    }

    const hasCountry = Boolean(values.countryId);
    const hasRegion = Boolean(values.regionId);

    if (hasCountry && hasRegion) {
      return;
    }

    for (const country of countries) {
      for (const region of country.regions ?? []) {
        const cityMatch = region.cities?.find((city) => city.id === values.cityId);
        if (cityMatch) {
          if (!hasCountry) {
            setFieldValue('countryId', country.id, false);
          }
          if (!hasRegion) {
            setFieldValue('regionId', region.id, false);
          }
          return;
        }
      }
    }
  }, [countries, setFieldValue, values.cityId, values.countryId, values.regionId]);

  const countryOptions: Option[] = useMemo(
    () =>
      countries.map((country) => ({
        value: country.id,
        label: country.name,
        description: undefined,
      })),
    [countries]
  );

  const regionOptions: Option[] = useMemo(
    () =>
      availableRegions.map((region) => ({
        value: region.id,
        label: region.name,
        description: selectedCountry ? selectedCountry.name : undefined,
      })),
    [availableRegions, selectedCountry]
  );

  const cityOptions: Option[] = useMemo(
    () =>
      availableCities.map((city) => ({
        value: city.id,
        label: city.name,
        description: selectedRegion ? selectedRegion.name : undefined,
      })),
    [availableCities, selectedRegion]
  );

  const isCountryDisabled = isCountriesLoading || isCountriesError;
  const isRegionDisabled = !values.countryId || availableRegions.length === 0;
  const isCityDisabled = !values.regionId || availableCities.length === 0;

  const handleCountrySelect = (countryId: string) => {
    // Clear error immediately
    setFieldError('countryId', undefined);
    // Set value and trigger validation
    setFieldValue('countryId', countryId, true);
    setFieldTouched('countryId', true, true);
    // Reset dependent fields
    setFieldValue('regionId', '', false);
    setFieldValue('cityId', '', false);
    setFieldTouched('regionId', false, false);
    setFieldTouched('cityId', false, false);
    // Clear errors for dependent fields
    setFieldError('regionId', undefined);
    setFieldError('cityId', undefined);
  };

  const handleRegionSelect = (regionId: string) => {
    // Clear error immediately
    setFieldError('regionId', undefined);
    // Set value and trigger validation
    setFieldValue('regionId', regionId, true);
    setFieldTouched('regionId', true, true);
    // Reset dependent field
    setFieldValue('cityId', '', false);
    setFieldTouched('cityId', false, false);
    // Clear error for dependent field
    setFieldError('cityId', undefined);
  };

  const handleCitySelect = (cityId: string) => {
    // Clear error immediately
    setFieldError('cityId', undefined);
    // Set value and trigger validation
    setFieldValue('cityId', cityId, true);
    setFieldTouched('cityId', true, true);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-50 rounded-lg">
          <MapPin className="w-5 h-5 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Location</h2>
      </div>

      <div className="space-y-6">
        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="address"
            value={values.address}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. 202 Near house# market"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c4233] focus:border-transparent"
          />
          {touched.address && errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address as string}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SearchableSelect
            name="countryId"
            label="Country"
            placeholder={isCountriesLoading ? 'Loading countries...' : 'Select Country'}
            options={countryOptions}
            value={values.countryId || ''}
            onSelect={handleCountrySelect}
            error={
              touched.countryId && errors.countryId && !values.countryId
                ? (errors.countryId as string)
                : undefined
            }
            required
            disabled={isCountryDisabled}
            isLoading={isCountriesLoading}
            helperText={
              isCountriesError
                ? 'Unable to load countries. Please refresh the page.'
                : undefined
            }
          />

          <SearchableSelect
            name="regionId"
            label="Region / State"
            placeholder={
              !values.countryId
                ? 'Select a country first'
                : availableRegions.length === 0
                  ? 'No regions found'
                  : 'Select State'
            }
            helperText={
              values.countryId && availableRegions.length === 0
                ? 'No regions found for selected country'
                : undefined
            }
            options={regionOptions}
            value={values.regionId || ''}
            onSelect={handleRegionSelect}
            error={
              touched.regionId && errors.regionId && !values.regionId
                ? (errors.regionId as string)
                : undefined
            }
            required
            disabled={isRegionDisabled}
          />

          <SearchableSelect
            name="cityId"
            label="City"
            placeholder={
              !values.regionId
                ? 'Select a state first'
                : availableCities.length === 0
                  ? 'No cities found'
                  : 'Select City'
            }
            helperText={
              values.regionId && availableCities.length === 0
                ? 'No cities found for selected state'
                : undefined
            }
            options={cityOptions}
            value={values.cityId || ''}
            onSelect={handleCitySelect}
            error={
              touched.cityId && errors.cityId && !values.cityId
                ? (errors.cityId as string)
                : undefined
            }
            required
            disabled={isCityDisabled}
          />
        </div>


        {/* CR Number (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CR Number (Commercial Registration)
          </label>
          <input
            type="text"
            name="crNumber"
            value={values.crNumber || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="1234567890"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c4233] focus:border-transparent"
          />
          <p className="mt-1 text-sm text-gray-500">Optional - helps verify your business</p>
        </div>

        {/* Coordinates Toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowCoordinates(!showCoordinates)}
            className="flex items-center gap-2 text-sm font-medium text-[#1c4233] hover:text-[#245240]"
          >
            {showCoordinates ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            Add GPS Coordinates (Optional)
          </button>
        </div>

        {/* Coordinates Fields */}
        {showCoordinates && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                name="latitude"
                value={values.latitude || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="24.7136"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c4233] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                name="longitude"
                value={values.longitude || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="46.6753"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c4233] focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}