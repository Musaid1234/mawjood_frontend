'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Country, Region } from '@/services/city.service';

interface RegionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  countries: Country[];
  defaultCountryId?: string;
  region?: Region | null;
  onSave: (regionData: { name: string; slug: string; countryId: string }) => Promise<void>;
}

export function RegionDialog({
  open,
  onOpenChange,
  countries,
  defaultCountryId,
  region,
  onSave,
}: RegionDialogProps) {
  const isEditMode = !!region;
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [countryId, setCountryId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  useEffect(() => {
    if (open) {
      setCountrySearch('');
      if (isEditMode && region) {
        setName(region.name || '');
        setSlug(region.slug || '');
        setCountryId(region.countryId || '');
        setSlugManuallyEdited(true);
      } else {
        const initialCountry =
          defaultCountryId && countries.some((country) => country.id === defaultCountryId)
            ? defaultCountryId
            : countries[0]?.id ?? '';
        setCountryId(initialCountry);
        setName('');
        setSlug('');
        setSlugManuallyEdited(false);
      }
    } else {
      setName('');
      setSlug('');
      setCountryId('');
      setSlugManuallyEdited(false);
      setCountrySearch('');
    }
  }, [open, countries, defaultCountryId, region, isEditMode]);

  const generateSlug = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugManuallyEdited) {
      setSlug(generateSlug(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true);
    setSlug(generateSlug(value));
  };

  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !slug.trim() || !countryId) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({ name: name.trim(), slug: slug.trim(), countryId });
      onOpenChange(false);
    } catch (err) {
      // Error handled in parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit State' : 'Add New State'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the state information below.' : 'Create a new State to organize cities.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="region-name" className="block text-sm font-medium text-gray-700 mb-1.5">
              State Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="region-name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g., Central Region"
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <label htmlFor="region-slug" className="block text-sm font-medium text-gray-700 mb-1.5">
              Slug <span className="text-red-500">*</span>
            </label>
            <Input
              id="region-slug"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="e.g., central-region"
              disabled={isSubmitting}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              URL-friendly version (lowercase, hyphens only)
            </p>
          </div>

          <div>
            <label htmlFor="region-country" className="block text-sm font-medium text-gray-700 mb-1.5">
              Country <span className="text-red-500">*</span>
            </label>
            <Select
              value={countryId}
              onValueChange={setCountryId}
              disabled={isSubmitting || countries.length === 0}
            >
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent className="w-full max-w-xs p-0">
                <div className="px-2 pb-2 pt-2 sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
                  <Input
                    placeholder="Search country..."
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {filteredCountries.map((country) => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.name}
                    </SelectItem>
                  ))}
                </div>
              </SelectContent>
            </Select>
            {countries.length === 0 && (
              <p className="text-xs text-red-500 mt-1">
                Add a country before creating states.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || countries.length === 0}>
              {isSubmitting ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update State' : 'Create State')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

