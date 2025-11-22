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
    <div className="flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 sm:p-8 lg:p-12">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-12 gap-y-10">
            {/* Left Column - 2/3 width */}
            <div className="lg:col-span-2 space-y-10">
              {/* Banner Image Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Banner Image
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Recommended size around <span className="font-semibold">1278 × 184</span> pixels (wide horizontal banner).
                </p>
                {imagePreview && (
                  <div className="mt-4 relative w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
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
                <label className="mt-4 flex justify-center items-center w-full px-6 py-10 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-[#1c4233] dark:hover:border-[#1c4233] transition-colors">
                  <div className="text-center">
                    <Upload className="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                    <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Click to upload banner image
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">JPG, PNG up to 5MB</p>
                  </div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={submitting}
                  />
                </label>
                {errors.image && <p className="mt-2 text-sm text-red-600">{errors.image}</p>}
              </div>

              {/* Linked Business & Placement Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Linked Business & Placement
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Choose which business this banner belongs to and select the location scope for display.
                </p>
                
                {/* Location Type Selector */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Display Location Scope
                  </label>
                  <div className="mt-2 flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setLocationType('city')}
                      className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
                        locationType === 'city'
                          ? 'bg-[#1c4233] text-white'
                          : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      City Only
                    </button>
                    <button
                      type="button"
                      onClick={() => setLocationType('region')}
                      className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                        locationType === 'region'
                          ? 'bg-[#1c4233] text-white'
                          : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      Entire Region/State
                    </button>
                    <button
                      type="button"
                      onClick={() => setLocationType('country')}
                      className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                        locationType === 'country'
                          ? 'bg-[#1c4233] text-white'
                          : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      Entire Country
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {locationType === 'city' && 'Advertisement will show only in the selected business\'s city'}
                    {locationType === 'region' && 'Advertisement will show across the entire region/state'}
                    {locationType === 'country' && 'Advertisement will show across the entire country'}
                  </p>
                </div>

                {/* Business Search and Placement Preview */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Business selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Business <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-1" ref={businessDropdownRef}>
                      <Input
                        value={businessSearchQuery}
                        onChange={(e) => {
                          setBusinessSearchQuery(e.target.value);
                          setShowBusinessDropdown(true);
                        }}
                        onFocus={() => setShowBusinessDropdown(true)}
                        placeholder="Search businesses by name..."
                        disabled={businessesLoading || submitting}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 shadow-sm focus:border-[#1c4233] focus:ring-[#1c4233] dark:focus:border-[#1c4233] dark:focus:ring-[#1c4233] sm:text-sm"
                      />
                      {businessSearchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setBusinessSearchQuery('');
                            setSelectedBusinessId('');
                            setSelectedBusinessData(null);
                            setBusinesses([]);
                            setTargetUrl('');
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      
                      {showBusinessDropdown && (businessSearchQuery.trim() || businesses.length > 0) && (
                        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                          {businessesLoading ? (
                            <div className="flex items-center justify-center py-4 text-sm text-gray-500 dark:text-gray-400">
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              Searching...
                            </div>
                          ) : businesses.length === 0 ? (
                            <div className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
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
                                  className={`w-full text-left px-3 py-2 text-sm flex flex-col border-b last:border-b-0 border-gray-200 dark:border-gray-700 transition-colors ${
                                    selected
                                      ? 'bg-[#1c4233]/10 dark:bg-[#1c4233]/20 text-[#1c4233] font-medium'
                                      : 'hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-200'
                                  }`}
                                >
                                  <span>{business.name}</span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {business.category?.name} • {business.city?.name}
                                  </span>
                                </button>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                    {errors.businessId && (
                      <p className="mt-1 text-sm text-red-600">{errors.businessId}</p>
                    )}
                    {errors.categoryId && (
                      <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
                    )}
                  </div>

                  {/* Placement preview */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Placement preview
                    </label>
                    {selectedBusiness ? (
                      <div className="mt-1 flex items-center justify-center p-4 h-[5.25rem] text-center bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-gray-700 rounded-md">
                        <div className="text-sm text-gray-900 dark:text-gray-200">
                          <p className="font-semibold">{selectedBusiness.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {selectedBusiness.category?.name} • {selectedBusiness.city?.name}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-1 flex items-center justify-center p-4 h-[5.25rem] text-center bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-gray-700 rounded-md">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Select a business on the left to see where this advertisement will appear.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - 1/3 width */}
            <div className="space-y-8">
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="title">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Featured: Test Restaurant"
                    disabled={submitting}
                    className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 shadow-sm focus:border-[#1c4233] focus:ring-[#1c4233] dark:focus:border-[#1c4233] dark:focus:ring-[#1c4233] sm:text-sm ${
                      errors.title ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                </div>

                {/* Target page */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="target-page">
                    Target page
                  </label>
                  <Input
                    id="target-page"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    disabled
                    placeholder="Will be filled from selected business"
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-slate-700 shadow-sm sm:text-sm cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Users will be redirected to the selected business detail page.
                  </p>
                </div>

                {/* Active checkbox */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Active</label>
                  <div className="mt-2 flex items-center">
                    <input
                      id="active"
                      name="active"
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      disabled={submitting}
                      className="h-4 w-4 rounded border-gray-300 text-[#1c4233] focus:ring-[#1c4233]"
                    />
                    <label htmlFor="active" className="ml-2 block text-sm text-gray-900 dark:text-gray-200 cursor-pointer">
                      Show this banner on the site
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Start and End dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <DateTimePicker
                      label="Start at (optional)"
                      value={startsAt}
                      onChange={(e) => setStartsAt((e.target as HTMLInputElement).value)}
                      disabled={submitting}
                      className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 shadow-sm focus:border-[#1c4233] focus:ring-[#1c4233] dark:focus:border-[#1c4233] dark:focus:ring-[#1c4233] sm:text-sm"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      If empty, the banner will start showing immediately.
                    </p>
                  </div>
                  <div>
                    <DateTimePicker
                      label="End at (optional)"
                      value={endsAt}
                      onChange={(e) => setEndsAt((e.target as HTMLInputElement).value)}
                      disabled={submitting}
                      className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 shadow-sm focus:border-[#1c4233] focus:ring-[#1c4233] dark:focus:border-[#1c4233] dark:focus:ring-[#1c4233] sm:text-sm"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      If empty, the banner will keep showing until you disable it.
                    </p>
                  </div>
                </div>

                {/* Internal Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="internal-notes">
                    Internal Notes
                  </label>
                  <textarea
                    id="internal-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    disabled={submitting}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 shadow-sm focus:border-[#1c4233] focus:ring-[#1c4233] dark:focus:border-[#1c4233] dark:focus:ring-[#1c4233] sm:text-sm resize-none"
                    placeholder="Optional notes about this advertisement (visible only in admin)."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <Button
              type="submit"
              disabled={submitting}
              className="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-sm font-semibold rounded-md text-white bg-[#1c4233] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1c4233] transition-colors"
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


