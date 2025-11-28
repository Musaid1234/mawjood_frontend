'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { advertisementService } from '@/services/advertisement.service';
import { categoryService, Category } from '@/services/category.service';
import { cityService, Region, Country, City } from '@/services/city.service';
import Image from 'next/image';
import { Loader2, Upload, X } from 'lucide-react';

type AdType = 'CATEGORY' | 'TOP' | 'FOOTER';
type LocationType = 'city' | 'region' | 'country' | 'global';

export default function AdvertisementsPage() {
  const router = useRouter();

  const [adType, setAdType] = useState<AdType>('TOP');
  const [title, setTitle] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [categoryId, setCategoryId] = useState<string>('none');
  const [locationType, setLocationType] = useState<LocationType>('global');
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [selectedRegionId, setSelectedRegionId] = useState<string>('');
  const [selectedCountryId, setSelectedCountryId] = useState<string>('');
  const [isActive, setIsActive] = useState(true);
  const [startsAt, setStartsAt] = useState<Date | null>(null);
  const [endsAt, setEndsAt] = useState<Date | null>(null);
  const [notes, setNotes] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Data for dropdowns
  const [categories, setCategories] = useState<Category[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Filtered options based on selections
  const [availableRegions, setAvailableRegions] = useState<Region[]>([]);
  const [availableCities, setAvailableCities] = useState<City[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const [categoriesData, countriesData] = await Promise.all([
          categoryService.fetchCategories(1, 1000).then((res) => {
            const allCategories: Category[] = [];
            res.data.categories.forEach((cat: Category) => {
              allCategories.push(cat);
              if (cat.subcategories) {
                allCategories.push(...cat.subcategories);
              }
            });
            return allCategories;
          }),
          cityService.fetchCountries(),
        ]);
        setCategories(categoriesData);
        setCountries(countriesData);
      } catch (error) {
        toast.error('Failed to load data');
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  // Fetch regions when country is selected
  useEffect(() => {
    if (selectedCountryId && (locationType === 'country' || locationType === 'region' || locationType === 'city')) {
      const country = countries.find((c) => c.id === selectedCountryId);
      if (country?.regions) {
        setAvailableRegions(country.regions);
      } else {
        cityService.fetchRegions(selectedCountryId).then(setAvailableRegions).catch(() => setAvailableRegions([]));
      }
    } else {
      setAvailableRegions([]);
    }
  }, [selectedCountryId, countries, locationType]);

  // Fetch all cities and filter by region when region is selected
  useEffect(() => {
    if (selectedRegionId && locationType === 'city') {
      const region = availableRegions.find((r) => r.id === selectedRegionId);
      if (region?.cities) {
        setAvailableCities(region.cities);
      } else {
        // Fetch all cities and filter by regionId
        cityService.fetchCities().then((allCities) => {
          const filtered = allCities.filter((city) => city.regionId === selectedRegionId);
          setAvailableCities(filtered);
        }).catch(() => setAvailableCities([]));
      }
    } else {
      setAvailableCities([]);
    }
  }, [selectedRegionId, availableRegions, locationType]);

  useEffect(() => {
    if (locationType === 'global') {
      setSelectedCityId('');
      setSelectedRegionId('');
      setSelectedCountryId('');
    } else if (locationType === 'country') {
      setSelectedCityId('');
      setSelectedRegionId('');
    } else if (locationType === 'region') {
      setSelectedCityId('');
    }
  }, [locationType]);

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
    if (!imageFile) newErrors.image = 'Advertisement image is required';
    if (!targetUrl.trim()) newErrors.targetUrl = 'Redirect URL is required';
    
    // Validate location based on selected type
    if (locationType === 'city' && !selectedCityId) {
      newErrors.location = 'Please select a city';
    } else if (locationType === 'region' && !selectedRegionId) {
      newErrors.location = 'Please select a region';
    } else if (locationType === 'country' && !selectedCountryId) {
      newErrors.location = 'Please select a country';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('targetUrl', targetUrl.trim());
      formData.append('adType', adType);
      formData.append('isActive', String(isActive));
      
      if (startsAt) {
        formData.append('startsAt', startsAt.toISOString());
      }
      if (endsAt) {
        formData.append('endsAt', endsAt.toISOString());
      }
      if (notes.trim()) {
        formData.append('notes', notes.trim());
      }
      if (categoryId && categoryId !== 'none') {
        formData.append('categoryId', categoryId);
      }
      
      // Add location based on selected location type
      if (locationType === 'city' && selectedCityId) {
        formData.append('cityId', selectedCityId);
      } else if (locationType === 'region' && selectedRegionId) {
        formData.append('regionId', selectedRegionId);
      } else if (locationType === 'country' && selectedCountryId) {
        formData.append('countryId', selectedCountryId);
      }
      // If global, don't add any location fields
      
      formData.append('image', imageFile!);

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Advertisement</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Create a new advertisement banner for category pages, top sidebar, or footer
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-12 gap-y-10">
            {/* Left Column - 2/3 width */}
            <div className="lg:col-span-2 space-y-10">
              {/* Ad Type Selection */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Advertisement Type
                </h2>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setAdType('CATEGORY')}
                    className={`px-6 py-3 text-sm font-semibold rounded-lg transition-colors ${
                      adType === 'CATEGORY'
                        ? 'bg-[#1c4233] text-white'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    Category Ad
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdType('TOP')}
                    className={`px-6 py-3 text-sm font-semibold rounded-lg transition-colors ${
                      adType === 'TOP'
                        ? 'bg-[#1c4233] text-white'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    Top/Sidebar Ad
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdType('FOOTER')}
                    className={`px-6 py-3 text-sm font-semibold rounded-lg transition-colors ${
                      adType === 'FOOTER'
                        ? 'bg-[#1c4233] text-white'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    Footer Ad
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {adType === 'CATEGORY' && 'This ad will appear on category listing pages'}
                  {adType === 'TOP' && 'This ad will appear at the top or in the sidebar'}
                  {adType === 'FOOTER' && 'This ad will appear in the footer section'}
                </p>
              </div>

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

              {/* Category & Location Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Category & Location
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Select which category this ad should appear in and where it should be displayed.
                </p>

                <div className="mt-6 space-y-6">
                  {/* Category Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category (Optional)
                    </label>
                    <Select
                      value={categoryId}
                      onValueChange={setCategoryId}
                      disabled={loadingData || submitting}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a category (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No category (show in all categories)</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      If no category is selected, the ad will appear in all categories
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Display Location
                    </label>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setLocationType('global')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          locationType === 'global'
                            ? 'bg-[#1c4233] text-white'
                            : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600'
                        }`}
                      >
                        Global
                      </button>
                      <button
                        type="button"
                        onClick={() => setLocationType('country')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          locationType === 'country'
                            ? 'bg-[#1c4233] text-white'
                            : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600'
                        }`}
                      >
                        Country
                      </button>
                      <button
                        type="button"
                        onClick={() => setLocationType('region')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          locationType === 'region'
                            ? 'bg-[#1c4233] text-white'
                            : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600'
                        }`}
                      >
                        Region/State
                      </button>
                      <button
                        type="button"
                        onClick={() => setLocationType('city')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          locationType === 'city'
                            ? 'bg-[#1c4233] text-white'
                            : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600'
                        }`}
                      >
                        City
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {locationType === 'global' && 'Advertisement will show globally across all locations'}
                      {locationType === 'country' && 'Advertisement will show across the entire country'}
                      {locationType === 'region' && 'Advertisement will show across the entire region/state'}
                      {locationType === 'city' && 'Advertisement will show only in the selected city'}
                    </p>
                  </div>

                  {/* Location Dropdowns */}
                  {locationType === 'country' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <Select
                        value={selectedCountryId}
                        onValueChange={setSelectedCountryId}
                        disabled={loadingData || submitting}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country.id} value={country.id}>
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {locationType === 'region' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Country <span className="text-red-500">*</span>
                        </label>
                        <Select
                          value={selectedCountryId}
                          onValueChange={(value) => {
                            setSelectedCountryId(value);
                            setSelectedRegionId('');
                          }}
                          disabled={loadingData || submitting}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a country first" />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem key={country.id} value={country.id}>
                                {country.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {selectedCountryId && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Region/State <span className="text-red-500">*</span>
                          </label>
                          <Select
                            value={selectedRegionId}
                            onValueChange={setSelectedRegionId}
                            disabled={loadingData || submitting || !selectedCountryId}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a region/state" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableRegions.map((region) => (
                                <SelectItem key={region.id} value={region.id}>
                                  {region.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </>
                  )}

                  {locationType === 'city' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Country <span className="text-red-500">*</span>
                        </label>
                        <Select
                          value={selectedCountryId}
                          onValueChange={(value) => {
                            setSelectedCountryId(value);
                            setSelectedRegionId('');
                            setSelectedCityId('');
                          }}
                          disabled={loadingData || submitting}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a country first" />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem key={country.id} value={country.id}>
                                {country.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {selectedCountryId && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Region/State <span className="text-red-500">*</span>
                          </label>
                          <Select
                            value={selectedRegionId}
                            onValueChange={(value) => {
                              setSelectedRegionId(value);
                              setSelectedCityId('');
                            }}
                            disabled={loadingData || submitting || !selectedCountryId}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a region/state" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableRegions.map((region) => (
                                <SelectItem key={region.id} value={region.id}>
                                  {region.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      {selectedRegionId && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            City <span className="text-red-500">*</span>
                          </label>
                          <Select
                            value={selectedCityId}
                            onValueChange={setSelectedCityId}
                            disabled={loadingData || submitting || !selectedRegionId}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a city" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableCities.map((city) => (
                                <SelectItem key={city.id} value={city.id}>
                                  {city.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </>
                  )}

                  {errors.location && (
                    <p className="text-sm text-red-600">{errors.location}</p>
                  )}
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
                    placeholder="e.g., Special Offer"
                    disabled={submitting}
                    className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 shadow-sm focus:border-[#1c4233] focus:ring-[#1c4233] dark:focus:border-[#1c4233] dark:focus:ring-[#1c4233] sm:text-sm ${
                      errors.title ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                </div>

                {/* Target URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="target-url">
                    Redirect URL <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="target-url"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="https://example.com or /businesses/slug"
                    disabled={submitting}
                    className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 shadow-sm focus:border-[#1c4233] focus:ring-[#1c4233] dark:focus:border-[#1c4233] dark:focus:ring-[#1c4233] sm:text-sm ${
                      errors.targetUrl ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.targetUrl && <p className="mt-1 text-sm text-red-600">{errors.targetUrl}</p>}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Where users will be redirected when they click the ad
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
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start at (optional)
                    </label>
                    <DateTimePicker
                      value={startsAt}
                      onChange={(date) => setStartsAt(date)}
                      disabled={submitting}
                      className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 shadow-sm focus:border-[#1c4233] focus:ring-[#1c4233] dark:focus:border-[#1c4233] dark:focus:ring-[#1c4233] sm:text-sm"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      If empty, the banner will start showing immediately.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End at (optional)
                    </label>
                    <DateTimePicker
                      value={endsAt}
                      onChange={(date) => setEndsAt(date)}
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

