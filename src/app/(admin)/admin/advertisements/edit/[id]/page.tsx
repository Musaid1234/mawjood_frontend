'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { advertisementService } from '@/services/advertisement.service';
import { categoryService, Category } from '@/services/category.service';
import { cityService, Region, Country, City } from '@/services/city.service';
import Image from 'next/image';
import { Loader2, Upload, ArrowLeft } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api.config';

type AdType = 'CATEGORY' | 'TOP' | 'FOOTER' | 'BUSINESS_LISTING' | 'BLOG_LISTING' | 'HOMEPAGE';
type LocationType = 'city' | 'region' | 'country' | 'global';

interface Advertisement {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl?: string | null;
  openInNewTab?: boolean;
  adType: AdType;
  isActive: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  notes?: string | null;
  countryId?: string | null;
  regionId?: string | null;
  cityId?: string | null;
  categoryId?: string | null;
  city?: { 
    id: string; 
    name: string;
    region?: {
      id: string;
      name: string;
      country?: {
        id: string;
        name: string;
      };
    };
  } | null;
  region?: { 
    id: string; 
    name: string;
    country?: {
      id: string;
      name: string;
    };
  } | null;
  country?: { id: string; name: string } | null;
  category?: { id: string; name: string } | null;
}

export default function EditAdvertisementPage() {
  const router = useRouter();
  const params = useParams();
  const adId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [adType, setAdType] = useState<AdType>('TOP');
  const [title, setTitle] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [openInNewTab, setOpenInNewTab] = useState(true);
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
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Search states for dropdowns
  const [categorySearch, setCategorySearch] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [regionSearch, setRegionSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');

  // Data for dropdowns
  const [categories, setCategories] = useState<Category[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [availableRegions, setAvailableRegions] = useState<Region[]>([]);
  const [availableCities, setAvailableCities] = useState<City[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  // Filter options based on search
  const filteredCategories = useMemo(() => {
    if (!categorySearch) return categories;
    const searchLower = categorySearch.toLowerCase();
    return categories.filter(cat => 
      cat.name.toLowerCase().includes(searchLower) ||
      cat.slug.toLowerCase().includes(searchLower)
    );
  }, [categories, categorySearch]);
  
  const filteredCountries = useMemo(() => {
    if (!countrySearch) return countries;
    const searchLower = countrySearch.toLowerCase();
    return countries.filter(country => 
      country.name.toLowerCase().includes(searchLower) ||
      country.slug.toLowerCase().includes(searchLower)
    );
  }, [countries, countrySearch]);
  
  const filteredRegions = useMemo(() => {
    if (!regionSearch) return availableRegions;
    const searchLower = regionSearch.toLowerCase();
    return availableRegions.filter(region => 
      region.name.toLowerCase().includes(searchLower) ||
      region.slug.toLowerCase().includes(searchLower)
    );
  }, [availableRegions, regionSearch]);
  
  const filteredCities = useMemo(() => {
    if (!citySearch) return availableCities;
    const searchLower = citySearch.toLowerCase();
    return availableCities.filter(city => 
      city.name.toLowerCase().includes(searchLower) ||
      city.slug.toLowerCase().includes(searchLower)
    );
  }, [availableCities, citySearch]);

  // Fetch advertisement data
  useEffect(() => {
    const fetchAdvertisement = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`${API_ENDPOINTS.ADVERTISEMENTS.BASE}/${adId}`);
        const ad: Advertisement = response.data.data;
        
        // Populate form with existing data
        setTitle(ad.title);
        setTargetUrl(ad.targetUrl || '');
        setOpenInNewTab(ad.openInNewTab !== false);
        setAdType(ad.adType);
        setIsActive(ad.isActive);
        setNotes(ad.notes || '');
        setExistingImageUrl(ad.imageUrl);
        
        if (ad.startsAt) setStartsAt(new Date(ad.startsAt));
        if (ad.endsAt) setEndsAt(new Date(ad.endsAt));
        
        // Set category
        if (ad.categoryId) {
          setCategoryId(ad.categoryId);
        }
        
        // Set location
        if (ad.cityId) {
          setLocationType('city');
          setSelectedCityId(ad.cityId);
          if (ad.city?.region) {
            setSelectedRegionId(ad.city.region.id);
            if (ad.city.region.country) {
              setSelectedCountryId(ad.city.region.country.id);
            }
          }
        } else if (ad.regionId) {
          setLocationType('region');
          setSelectedRegionId(ad.regionId);
          if (ad.region?.country) {
            setSelectedCountryId(ad.region.country.id);
          }
        } else if (ad.countryId) {
          setLocationType('country');
          setSelectedCountryId(ad.countryId);
        } else {
          setLocationType('global');
        }
        
      } catch (error: any) {
        console.error('Error fetching advertisement:', error);
        toast.error('Failed to load advertisement');
        router.push('/admin/advertisements/list');
      } finally {
        setLoading(false);
      }
    };

    if (adId) {
      fetchAdvertisement();
    }
  }, [adId, router]);

  // Fetch categories and countries
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
      } catch {
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

  // Fetch cities when region is selected
  useEffect(() => {
    if (selectedRegionId && locationType === 'city') {
      const region = availableRegions.find((r) => r.id === selectedRegionId);
      if (region?.cities) {
        setAvailableCities(region.cities);
      } else {
        cityService.fetchCities().then((allCities) => {
          const filtered = allCities.filter((city) => city.regionId === selectedRegionId);
          setAvailableCities(filtered);
        }).catch(() => setAvailableCities([]));
      }
    } else {
      setAvailableCities([]);
    }
  }, [selectedRegionId, availableRegions, locationType]);

  // Reset location fields when location type changes
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

  // Clear category and location when switching to ad types that don't need them
  useEffect(() => {
    if (adType === 'HOMEPAGE' || adType === 'BUSINESS_LISTING' || adType === 'BLOG_LISTING') {
      setCategoryId('none');
      setLocationType('global');
      setSelectedCityId('');
      setSelectedRegionId('');
      setSelectedCountryId('');
    }
  }, [adType]);

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
    if (!targetUrl.trim()) newErrors.targetUrl = 'Redirect URL is required';
    
    // Only validate location for CATEGORY, TOP, and FOOTER ad types
    if (adType === 'CATEGORY' || adType === 'TOP' || adType === 'FOOTER') {
      if (locationType === 'city' && !selectedCityId) {
        newErrors.location = 'Please select a city';
      } else if (locationType === 'region' && !selectedRegionId) {
        newErrors.location = 'Please select a region';
      } else if (locationType === 'country' && !selectedCountryId) {
        newErrors.location = 'Please select a country';
      }
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
      formData.append('openInNewTab', String(openInNewTab));
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
      
      // Only add category and location for CATEGORY, TOP, and FOOTER ad types
      if (adType === 'CATEGORY' || adType === 'TOP' || adType === 'FOOTER') {
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
      }
      
      // Only append image if a new one was selected
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await advertisementService.updateAdvertisement(adId, formData);
      toast.success('Advertisement updated successfully');
      router.push('/admin/advertisements/list');
    } catch (error: any) {
      console.error('Error updating advertisement:', error);
      toast.error(error?.message || 'Failed to update advertisement');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#1c4233]" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 sm:p-8 lg:p-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Advertisement</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Update advertisement details and settings
            </p>
          </div>
          <Button
            type="button"
            onClick={() => router.push('/admin/advertisements/list')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to List
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-12 gap-y-10">
            {/* Left Column - 2/3 width */}
            <div className="lg:col-span-2 space-y-10">
              {/* Ad Type Selection */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Advertisement Location
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setAdType('CATEGORY')}
                    className={`px-4 py-3 text-sm font-semibold rounded-lg transition-colors ${
                      adType === 'CATEGORY'
                        ? 'bg-[#1c4233] text-white'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    Category Sidebar
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdType('BUSINESS_LISTING')}
                    className={`px-4 py-3 text-sm font-semibold rounded-lg transition-colors ${
                      adType === 'BUSINESS_LISTING'
                        ? 'bg-[#1c4233] text-white'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    Business Listing
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdType('BLOG_LISTING')}
                    className={`px-4 py-3 text-sm font-semibold rounded-lg transition-colors ${
                      adType === 'BLOG_LISTING'
                        ? 'bg-[#1c4233] text-white'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    Blog Listing
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdType('HOMEPAGE')}
                    className={`px-4 py-3 text-sm font-semibold rounded-lg transition-colors ${
                      adType === 'HOMEPAGE'
                        ? 'bg-[#1c4233] text-white'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    Homepage
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdType('TOP')}
                    className={`px-4 py-3 text-sm font-semibold rounded-lg transition-colors ${
                      adType === 'TOP'
                        ? 'bg-[#1c4233] text-white'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    Top Banner
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdType('FOOTER')}
                    className={`px-4 py-3 text-sm font-semibold rounded-lg transition-colors ${
                      adType === 'FOOTER'
                        ? 'bg-[#1c4233] text-white'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    Footer Banner
                  </button>
                </div>
                <div className="mt-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
                    {adType === 'CATEGORY' && '📍 Category Sidebar (Right Sidebar on Category Pages)'}
                    {adType === 'BUSINESS_LISTING' && '📍 Business Listing Sidebar (Right Sidebar on /businesses)'}
                    {adType === 'BLOG_LISTING' && '📍 Blog Listing Sidebar (Right Sidebar on Blog Listing)'}
                    {adType === 'HOMEPAGE' && '📍 Homepage Banner (Top of Homepage)'}
                    {adType === 'TOP' && '📍 Top Banner (Top of Pages)'}
                    {adType === 'FOOTER' && '📍 Footer Banner (Bottom of Pages)'}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    {adType === 'CATEGORY' && 'Displays in the right sidebar on category listing pages. Vertical/square format recommended (300×350px).'}
                    {adType === 'BUSINESS_LISTING' && 'Displays in the right sidebar on the businesses listing page (/businesses). Vertical format recommended (300×350px). No category/location targeting needed.'}
                    {adType === 'BLOG_LISTING' && 'Displays in the right sidebar on blog listing pages. Vertical format recommended (300×350px). No category/location targeting needed.'}
                    {adType === 'HOMEPAGE' && 'Displays as a prominent banner on the homepage. Horizontal format recommended (1278×184px). No category/location targeting needed.'}
                    {adType === 'TOP' && 'Displays at the top of pages as a horizontal banner. Supports multiple ads with auto-rotation (1278×184px).'}
                    {adType === 'FOOTER' && 'Displays at the bottom of pages as a horizontal banner (1278×184px).'}
                  </p>
                </div>
              </div>

              {/* Banner Image Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Advertisement Image
                </h2>
                <div className="mt-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm font-medium text-yellow-900 dark:text-yellow-200 mb-1">
                    Recommended Image Sizes:
                  </p>
                  <ul className="text-xs text-yellow-800 dark:text-yellow-300 space-y-1 list-disc list-inside">
                    {(adType === 'CATEGORY' || adType === 'BUSINESS_LISTING' || adType === 'BLOG_LISTING') && (
                      <li><span className="font-semibold">Sidebar Ad:</span> 300 × 350 pixels (vertical format)</li>
                    )}
                    {(adType === 'TOP' || adType === 'FOOTER' || adType === 'HOMEPAGE') && (
                      <li><span className="font-semibold">Horizontal Banner:</span> 1278 × 184 pixels (wide banner)</li>
                    )}
                  </ul>
                </div>
                {(imagePreview || existingImageUrl) && (
                  <div className="mt-4 relative w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                    <div className={`relative ${
                      (adType === 'CATEGORY' || adType === 'BUSINESS_LISTING' || adType === 'BLOG_LISTING')
                        ? 'aspect-[300/350] max-w-[300px] mx-auto' 
                        : 'aspect-[1278/184]'
                    }`}>
                      <Image
                        src={imagePreview || existingImageUrl || ''}
                        alt="Advertisement preview"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <p className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">
                      {imagePreview ? 'New Image Preview' : 'Current Image'} ({
                        (adType === 'CATEGORY' || adType === 'BUSINESS_LISTING' || adType === 'BLOG_LISTING') 
                          ? 'Sidebar' 
                          : adType === 'HOMEPAGE' 
                            ? 'Homepage Banner' 
                            : adType === 'TOP' 
                              ? 'Top Banner' 
                              : 'Footer Banner'
                      } format)
                    </p>
                  </div>
                )}
                <label className="mt-4 flex justify-center items-center w-full px-6 py-10 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-[#1c4233] dark:hover:border-[#1c4233] transition-colors">
                  <div className="text-center">
                    <Upload className="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                    <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {imagePreview || existingImageUrl ? 'Click to change image' : 'Click to upload banner image'}
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

              {/* Only show Category & Location for CATEGORY, TOP, and FOOTER ad types */}
              {(adType === 'CATEGORY' || adType === 'TOP' || adType === 'FOOTER') && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Category & Location
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Select which category this ad should appear in and where it should be displayed.
                </p>

                <div className="mt-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category (Optional)
                    </label>
                    <Select
                      value={categoryId}
                      onValueChange={(value) => {
                        setCategoryId(value);
                        setCategorySearch('');
                      }}
                      disabled={loadingData || submitting}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a category (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="p-2 border-b sticky top-0 bg-white dark:bg-slate-800 z-10">
                          <input
                            type="text"
                            placeholder="Search categories..."
                            value={categorySearch}
                            onChange={(e) => {
                              setCategorySearch(e.target.value);
                              e.stopPropagation();
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1c4233] bg-white dark:bg-slate-700"
                          />
                        </div>
                        <SelectItem value="none">No category (show in all categories)</SelectItem>
                        {filteredCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                        {filteredCategories.length === 0 && categorySearch && (
                          <div className="px-2 py-1.5 text-sm text-gray-500">No categories found</div>
                        )}
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
                      onValueChange={(value) => {
                        setSelectedCountryId(value);
                        setCountrySearch('');
                      }}
                      disabled={loadingData || submitting}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="p-2 border-b sticky top-0 bg-white dark:bg-slate-800 z-10">
                          <input
                            type="text"
                            placeholder="Search countries..."
                            value={countrySearch}
                            onChange={(e) => {
                              setCountrySearch(e.target.value);
                              e.stopPropagation();
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1c4233] bg-white dark:bg-slate-700"
                          />
                        </div>
                        {filteredCountries.map((country) => (
                          <SelectItem key={country.id} value={country.id}>
                            {country.name}
                          </SelectItem>
                        ))}
                        {filteredCountries.length === 0 && countrySearch && (
                          <div className="px-2 py-1.5 text-sm text-gray-500">No countries found</div>
                        )}
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
                            setCountrySearch('');
                          }}
                          disabled={loadingData || submitting}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a country first" />
                          </SelectTrigger>
                          <SelectContent>
                            <div className="p-2 border-b sticky top-0 bg-white dark:bg-slate-800 z-10">
                              <input
                                type="text"
                                placeholder="Search countries..."
                                value={countrySearch}
                                onChange={(e) => {
                                  setCountrySearch(e.target.value);
                                  e.stopPropagation();
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1c4233] bg-white dark:bg-slate-700"
                              />
                            </div>
                            {filteredCountries.map((country) => (
                              <SelectItem key={country.id} value={country.id}>
                                {country.name}
                              </SelectItem>
                            ))}
                            {filteredCountries.length === 0 && countrySearch && (
                              <div className="px-2 py-1.5 text-sm text-gray-500">No countries found</div>
                            )}
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
                              setRegionSearch('');
                            }}
                            disabled={loadingData || submitting || !selectedCountryId}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a region/state" />
                            </SelectTrigger>
                            <SelectContent>
                              <div className="p-2 border-b sticky top-0 bg-white dark:bg-slate-800 z-10">
                                <input
                                  type="text"
                                  placeholder="Search regions..."
                                  value={regionSearch}
                                  onChange={(e) => {
                                    setRegionSearch(e.target.value);
                                    e.stopPropagation();
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1c4233] bg-white dark:bg-slate-700"
                                />
                              </div>
                              {filteredRegions.map((region) => (
                                <SelectItem key={region.id} value={region.id}>
                                  {region.name}
                                </SelectItem>
                              ))}
                              {filteredRegions.length === 0 && regionSearch && (
                                <div className="px-2 py-1.5 text-sm text-gray-500">No regions found</div>
                              )}
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
                            setCountrySearch('');
                          }}
                          disabled={loadingData || submitting}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a country first" />
                          </SelectTrigger>
                          <SelectContent>
                            <div className="p-2 border-b sticky top-0 bg-white dark:bg-slate-800 z-10">
                              <input
                                type="text"
                                placeholder="Search countries..."
                                value={countrySearch}
                                onChange={(e) => {
                                  setCountrySearch(e.target.value);
                                  e.stopPropagation();
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1c4233] bg-white dark:bg-slate-700"
                              />
                            </div>
                            {filteredCountries.map((country) => (
                              <SelectItem key={country.id} value={country.id}>
                                {country.name}
                              </SelectItem>
                            ))}
                            {filteredCountries.length === 0 && countrySearch && (
                              <div className="px-2 py-1.5 text-sm text-gray-500">No countries found</div>
                            )}
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
                              setRegionSearch('');
                            }}
                            disabled={loadingData || submitting || !selectedCountryId}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a region/state" />
                            </SelectTrigger>
                            <SelectContent>
                              <div className="p-2 border-b sticky top-0 bg-white dark:bg-slate-800 z-10">
                                <input
                                  type="text"
                                  placeholder="Search regions..."
                                  value={regionSearch}
                                  onChange={(e) => {
                                    setRegionSearch(e.target.value);
                                    e.stopPropagation();
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1c4233] bg-white dark:bg-slate-700"
                                />
                              </div>
                              {filteredRegions.map((region) => (
                                <SelectItem key={region.id} value={region.id}>
                                  {region.name}
                                </SelectItem>
                              ))}
                              {filteredRegions.length === 0 && regionSearch && (
                                <div className="px-2 py-1.5 text-sm text-gray-500">No regions found</div>
                              )}
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
                            onValueChange={(value) => {
                              setSelectedCityId(value);
                              setCitySearch('');
                            }}
                            disabled={loadingData || submitting || !selectedRegionId}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a city" />
                            </SelectTrigger>
                            <SelectContent>
                              <div className="p-2 border-b sticky top-0 bg-white dark:bg-slate-800 z-10">
                                <input
                                  type="text"
                                  placeholder="Search cities..."
                                  value={citySearch}
                                  onChange={(e) => {
                                    setCitySearch(e.target.value);
                                    e.stopPropagation();
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1c4233] bg-white dark:bg-slate-700"
                                />
                              </div>
                              {filteredCities.map((city) => (
                                <SelectItem key={city.id} value={city.id}>
                                  {city.name}
                                </SelectItem>
                              ))}
                              {filteredCities.length === 0 && citySearch && (
                                <div className="px-2 py-1.5 text-sm text-gray-500">No cities found</div>
                              )}
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
              )}
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
                    className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 shadow-sm focus:border-[#1c4233] focus:ring-[#1c4233] sm:text-sm ${
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
                    className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 shadow-sm focus:border-[#1c4233] focus:ring-[#1c4233] sm:text-sm ${
                      errors.targetUrl ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.targetUrl && <p className="mt-1 text-sm text-red-600">{errors.targetUrl}</p>}
                </div>

                {/* Open in new tab checkbox */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Link Behavior</label>
                  <div className="mt-2 flex items-center">
                    <input
                      id="openInNewTab"
                      name="openInNewTab"
                      type="checkbox"
                      checked={openInNewTab}
                      onChange={(e) => setOpenInNewTab(e.target.checked)}
                      disabled={submitting}
                      className="h-4 w-4 rounded border-gray-300 text-[#1c4233] focus:ring-[#1c4233]"
                    />
                    <label htmlFor="openInNewTab" className="ml-2 block text-sm text-gray-900 dark:text-gray-200 cursor-pointer">
                      Open link in new tab
                    </label>
                  </div>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start at (optional)
                  </label>
                  <DateTimePicker
                    value={startsAt}
                    onChange={(date) => setStartsAt(date)}
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End at (optional)
                  </label>
                  <DateTimePicker
                    value={endsAt}
                    onChange={(date) => setEndsAt(date)}
                    disabled={submitting}
                  />
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
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 shadow-sm focus:border-[#1c4233] focus:ring-[#1c4233] sm:text-sm resize-none p-3"
                    placeholder="Optional notes about this advertisement (visible only in admin)."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/advertisements/list')}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-sm font-semibold rounded-md text-white bg-[#1c4233] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1c4233] transition-colors"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                'Update Advertisement'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

