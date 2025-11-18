'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { businessService, Business } from '@/services/business.service';
import { advertisementService } from '@/services/advertisement.service';
import { cityService, Region, Country } from '@/services/city.service';
import Image from 'next/image';
import { Loader2, Upload, X } from 'lucide-react';

export default function AdvertisementsPage() {
  const router = useRouter();
  const businessDropdownRef = useRef<HTMLDivElement>(null);
  const [selectedBusinessData, setSelectedBusinessData] = useState<Business | null>(null);

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [businessesLoading, setBusinessesLoading] = useState(false);
  const [businessSearchQuery, setBusinessSearchQuery] = useState('');
  const [showBusinessDropdown, setShowBusinessDropdown] = useState(false);
  const [regions, setRegions] = useState<Region[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [regionsLoading, setRegionsLoading] = useState(false);
  const [countriesLoading, setCountriesLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [derivedCategoryId, setDerivedCategoryId] = useState('');
  const [derivedCityId, setDerivedCityId] = useState('');
  const [derivedRegionId, setDerivedRegionId] = useState('');
  const [derivedCountryId, setDerivedCountryId] = useState('');
  const [locationType, setLocationType] = useState<'city' | 'region' | 'country'>('city');
  const [targetUrl, setTargetUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch regions and countries
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setRegionsLoading(true);
        const data = await cityService.fetchRegions();
        setRegions(data);
      } catch (error: any) {
        console.error('Error fetching regions:', error);
      } finally {
        setRegionsLoading(false);
      }
    };

    const fetchCountries = async () => {
      try {
        setCountriesLoading(true);
        const data = await cityService.fetchCountries();
        setCountries(data);
      } catch (error: any) {
        console.error('Error fetching countries:', error);
      } finally {
        setCountriesLoading(false);
      }
    };

    fetchRegions();
    fetchCountries();
  }, []);

  // Search businesses with debounce
  useEffect(() => {
    if (!businessSearchQuery.trim()) {
      setBusinesses([]);
      return;
    }

    const debounceTimer = setTimeout(async () => {
      try {
        setBusinessesLoading(true);
        const response = await businessService.searchBusinesses({
          search: businessSearchQuery.trim(),
          limit: 20,
          page: 1,
        });
        setBusinesses(response.businesses || []);
      } catch (error: any) {
        console.error('Error searching businesses:', error);
        toast.error(error?.message || 'Failed to search businesses');
        setBusinesses([]);
      } finally {
        setBusinessesLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [businessSearchQuery]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        businessDropdownRef.current &&
        !businessDropdownRef.current.contains(event.target as Node)
      ) {
        setShowBusinessDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleBusinessSelect = async (business: Business) => {
    setSelectedBusinessId(business.id);
    setSelectedBusinessData(business);
    setTargetUrl(business.slug);
    setDerivedCategoryId(business.category?.id || '');
    setDerivedCityId(business.city?.id || '');
    
    // Fetch full business details to get region and country info
    try {
      const fullBusiness = await businessService.getBusinessById(business.id);
      if (fullBusiness.city) {
        // Try to find region by matching city name or fetch city details
        // For now, we'll use the city ID to find the region
        // This assumes the city has a regionId - if not, we may need to fetch city details
        const cityWithRegion = await cityService.fetchCityBySlug(fullBusiness.city.slug);
        if (cityWithRegion?.regionId) {
          const region = regions.find((r) => r.id === cityWithRegion.regionId);
          if (region) {
            setDerivedRegionId(region.id);
            if (region.countryId) {
              setDerivedCountryId(region.countryId);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching business details:', error);
      // Continue without region/country if fetch fails
    }
    
    if (!title.trim()) {
      setTitle(business.name);
    }
    setShowBusinessDropdown(false);
    setBusinessSearchQuery(business.name);
  };

  const selectedBusiness = selectedBusinessData;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!selectedBusinessId) newErrors.businessId = 'Select a business to link this advertisement to';
    if (!derivedCategoryId) newErrors.categoryId = 'Selected business has no category';
    
    // Validate location based on selected type
    if (locationType === 'city' && !derivedCityId) {
      newErrors.cityId = 'Selected business has no city';
    } else if (locationType === 'region' && !derivedRegionId) {
      newErrors.regionId = 'Selected business has no region';
    } else if (locationType === 'country' && !derivedCountryId) {
      newErrors.countryId = 'Selected business has no country';
    }
    
    if (!imageFile) newErrors.image = 'Advertisement image is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (!imageFile) {
      toast.error('Advertisement image is required');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('targetUrl', targetUrl.trim());
      formData.append('isActive', String(isActive));
      if (startsAt) {
        formData.append('startsAt', new Date(startsAt).toISOString());
      }
      if (endsAt) {
        formData.append('endsAt', new Date(endsAt).toISOString());
      }
      if (notes.trim()) {
        formData.append('notes', notes.trim());
      }
      if (derivedCategoryId) {
        formData.append('categoryId', derivedCategoryId);
      }
      
      // Add location based on selected location type
      if (locationType === 'city' && derivedCityId) {
        formData.append('cityId', derivedCityId);
      } else if (locationType === 'region' && derivedRegionId) {
        formData.append('regionId', derivedRegionId);
      } else if (locationType === 'country' && derivedCountryId) {
        formData.append('countryId', derivedCountryId);
      }
      
      formData.append('image', imageFile);

      await advertisementService.createAdvertisement(formData);
      toast.success('Advertisement created successfully');
      router.push('/admin');
    } catch (error: any) {
      console.error('Error creating advertisement:', error);
      toast.error(error?.message || 'Failed to create advertisement');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Create Advertisement
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 max-w-2xl">
              Highlight one of your businesses with a wide banner that appears on relevant listing pages.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 space-y-8 shadow-sm"
        >
          {/* Top: Banner + basic info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Banner image (2/3) */}
            <div className="lg:col-span-2 space-y-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Banner Image
              </h2>
              <p className="text-sm text-gray-500">
                Recommended size around <span className="font-semibold">1278 × 184</span> pixels (wide
                horizontal banner).
              </p>
              {imagePreview && (
                <div className="relative w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                  <div className="aspect-[1278/184] relative">
                    <Image
                      src={imagePreview}
                      alt="Advertisement preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}
              <label
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#1c4233] hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-4 pb-5">
                  <Upload className="w-7 h-7 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Click to upload</span> banner image
                  </p>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={submitting}
                />
              </label>
              {errors.image && <p className="text-sm text-red-600">{errors.image}</p>}
            </div>

            {/* Basic info (1/3) */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Title <span className="text-red-500">*</span>
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Featured: Test Restaurant"
                  disabled={submitting}
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Target page
                </label>
                <Input
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  disabled
                  placeholder="Will be filled from selected business"
                  className="bg-gray-50 cursor-not-allowed text-sm"
                />
                <p className="text-xs text-gray-500">
                  Users will be redirected to the selected business detail page.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Active
                </label>
                <div className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2">
                  <input
                    id="ad-active"
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    disabled={submitting}
                    className="w-4 h-4 text-[#1c4233] border-gray-300 rounded focus:ring-[#1c4233]"
                  />
                  <label htmlFor="ad-active" className="text-sm text-gray-700 cursor-pointer">
                    Show this banner on the site
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Business & placement */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Linked Business & Placement
            </h2>
            <p className="text-sm text-gray-500 mb-2">
              Choose which business this banner belongs to and select the location scope for display.
            </p>

            {/* Location Type Selector */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Display Location Scope
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setLocationType('city')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    locationType === 'city'
                      ? 'bg-[#1c4233] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  City Only
                </button>
                <button
                  type="button"
                  onClick={() => setLocationType('region')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    locationType === 'region'
                      ? 'bg-[#1c4233] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Entire Region/State
                </button>
                <button
                  type="button"
                  onClick={() => setLocationType('country')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    locationType === 'country'
                      ? 'bg-[#1c4233] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Entire Country
                </button>
              </div>
              <p className="text-xs text-gray-500">
                {locationType === 'city' && 'Advertisement will show only in the selected business\'s city'}
                {locationType === 'region' && 'Advertisement will show across the entire region/state'}
                {locationType === 'country' && 'Advertisement will show across the entire country'}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Business selector */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Business <span className="text-red-500">*</span>
                </label>
                <div className="relative" ref={businessDropdownRef}>
                  <Input
                    value={businessSearchQuery}
                    onChange={(e) => {
                      setBusinessSearchQuery(e.target.value);
                      setShowBusinessDropdown(true);
                    }}
                    onFocus={() => setShowBusinessDropdown(true)}
                    placeholder="Search businesses by name..."
                    disabled={businessesLoading}
                  />
                  {businessSearchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setBusinessSearchQuery('');
                        setSelectedBusinessId('');
                        setSelectedBusinessData(null);
                        setBusinesses([]);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  
                  {showBusinessDropdown && (businessSearchQuery.trim() || businesses.length > 0) && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                      {businessesLoading ? (
                        <div className="flex items-center justify-center py-4 text-sm text-gray-500">
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Searching...
                        </div>
                      ) : businesses.length === 0 ? (
                        <div className="py-4 text-center text-sm text-gray-500">
                          {businessSearchQuery.trim() ? 'No businesses found' : 'Start typing to search...'}
                        </div>
                      ) : (
                        businesses.map((business) => {
                          const selected = selectedBusinessId === business.id;
                          return (
                            <button
                              key={business.id}
                              type="button"
                              onClick={() => handleBusinessSelect(business)}
                              className={`w-full text-left px-3 py-2 text-sm flex flex-col border-b last:border-b-0 transition-colors ${
                                selected
                                  ? 'bg-[#1c4233]/10 text-[#1c4233] font-medium'
                                  : 'hover:bg-gray-50 text-gray-800'
                              }`}
                            >
                              <span>{business.name}</span>
                              <span className="text-xs text-gray-500">
                                {business.category?.name} • {business.city?.name}
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
                {selectedBusiness && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                    <span className="font-medium text-green-800">Selected: </span>
                    <span className="text-green-700">{selectedBusiness.name}</span>
                  </div>
                )}
                {errors.businessId && (
                  <p className="text-sm text-red-600">{errors.businessId}</p>
                )}
                {errors.categoryId && (
                  <p className="text-sm text-red-600">{errors.categoryId}</p>
                )}
              </div>

              {/* Placement summary */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Placement preview
                </label>
                {selectedBusiness ? (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-2">
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedBusiness.name}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-1 text-xs">
                      <span className="inline-flex items-center rounded-full bg-[#1c4233]/10 text-[#1c4233] px-2 py-1">
                        Category: {selectedBusiness.category?.name}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-gray-200 text-gray-800 px-2 py-1">
                        City: {selectedBusiness.city?.name}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      This banner will be eligible to show for{' '}
                      <span className="font-medium">
                        {selectedBusiness.category?.name}
                      </span>{' '}
                      listings{' '}
                      {locationType === 'city' && (
                        <>in <span className="font-medium">{selectedBusiness.city?.name}</span>.</>
                      )}
                      {locationType === 'region' && (
                        <>across the entire <span className="font-medium">region/state</span>.</>
                      )}
                      {locationType === 'country' && (
                        <>across the entire <span className="font-medium">country</span>.</>
                      )}
                    </p>
                  </div>
                ) : (
                  <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 text-sm text-gray-500">
                    Select a business on the left to see where this advertisement will appear.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Scheduling & notes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3 md:col-span-1">
              <DateTimePicker
                label="Start at (optional)"
                value={startsAt}
                onChange={(e) => setStartsAt((e.target as HTMLInputElement).value)}
                disabled={submitting}
              />
              <p className="text-xs text-gray-500">
                If empty, the banner will start showing immediately.
              </p>
            </div>

            <div className="space-y-3 md:col-span-1">
              <DateTimePicker
                label="End at (optional)"
                value={endsAt}
                onChange={(e) => setEndsAt((e.target as HTMLInputElement).value)}
                disabled={submitting}
              />
              <p className="text-xs text-gray-500">
                If empty, the banner will keep showing until you disable it.
              </p>
            </div>

            <div className="space-y-3 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700">
                Internal Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                disabled={submitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c4233] focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed text-sm h-full"
                placeholder="Optional notes about this advertisement (visible only in admin)."
              />
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-gray-100 mt-2">
            <Button
              type="submit"
              disabled={submitting}
              className="bg-[#1c4233] hover:bg-[#245240] text-white px-8"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Create Advertisement'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


