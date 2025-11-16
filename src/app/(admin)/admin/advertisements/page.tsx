'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { businessService, Business } from '@/services/business.service';
import { advertisementService } from '@/services/advertisement.service';
import Image from 'next/image';
import { Loader2, Upload } from 'lucide-react';

export default function AdvertisementsPage() {
  const router = useRouter();

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [businessesLoading, setBusinessesLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [derivedCategoryId, setDerivedCategoryId] = useState('');
  const [derivedCityId, setDerivedCityId] = useState('');
  const [businessSearch, setBusinessSearch] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setBusinessesLoading(true);
        const response = await businessService.getMyBusinesses();
        setBusinesses(response || []);
      } catch (error: any) {
        console.error('Error fetching businesses for advertisements:', error);
        toast.error(error?.message || 'Failed to load businesses');
      } finally {
        setBusinessesLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  const filteredBusinesses = useMemo(() => {
    const query = businessSearch.trim().toLowerCase();
    if (!query) return businesses;
    return businesses.filter((b) =>
      b.name.toLowerCase().includes(query) || b.slug.toLowerCase().includes(query)
    );
  }, [businesses, businessSearch]);

  const handleBusinessSelect = (businessId: string) => {
    setSelectedBusinessId(businessId);
    const business = businesses.find((b) => b.id === businessId);
    if (business) {
      setTargetUrl(business.slug);
      setDerivedCategoryId(business.category?.id || '');
      setDerivedCityId(business.city?.id || '');
      if (!title.trim()) {
        setTitle(business.name);
      }
    }
  };

  const selectedBusiness = useMemo(
    () => businesses.find((b) => b.id === selectedBusinessId) || null,
    [businesses, selectedBusinessId]
  );

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
      if (derivedCityId) {
        formData.append('cityId', derivedCityId);
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
              Choose which business this banner belongs to. We&apos;ll automatically use its category
              and city to decide where to display the advertisement.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Business selector */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Business <span className="text-red-500">*</span>
                </label>
                <Input
                  value={businessSearch}
                  onChange={(e) => setBusinessSearch(e.target.value)}
                  placeholder="Search by business name or slug..."
                  disabled={businessesLoading}
                />
                <div className="border border-gray-200 rounded-lg max-h-56 overflow-y-auto mt-2 bg-white">
                  {businessesLoading ? (
                    <div className="flex items-center justify-center py-4 text-sm text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Loading businesses...
                    </div>
                  ) : filteredBusinesses.length === 0 ? (
                    <div className="py-4 text-center text-sm text-gray-500">
                      No businesses found.
                    </div>
                  ) : (
                    filteredBusinesses.map((business) => {
                      const selected = selectedBusinessId === business.id;
                      return (
                        <button
                          key={business.id}
                          type="button"
                          onClick={() => handleBusinessSelect(business.id)}
                          className={`w-full text-left px-3 py-2 text-sm flex flex-col border-b last:border-b-0 transition-colors ${
                            selected
                              ? 'bg-[#1c4233]/10 text-[#1c4233] font-medium'
                              : 'hover:bg-gray-50 text-gray-800'
                          }`}
                        >
                          <span>{business.name}</span>
                          <span className="text-xs text-gray-500">
                            /businesses/{business.slug}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
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
                      listings in{' '}
                      <span className="font-medium">
                        {selectedBusiness.city?.name}
                      </span>
                      .
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


