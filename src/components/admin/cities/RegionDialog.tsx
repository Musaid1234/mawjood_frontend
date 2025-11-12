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
import { Country } from '@/services/city.service';

interface RegionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  countries: Country[];
  defaultCountryId?: string;
  onSave: (regionData: { name: string; slug: string; countryId: string }) => Promise<void>;
}

export function RegionDialog({
  open,
  onOpenChange,
  countries,
  defaultCountryId,
  onSave,
}: RegionDialogProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [countryId, setCountryId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  useEffect(() => {
    if (open) {
      const initialCountry =
        defaultCountryId && countries.some((country) => country.id === defaultCountryId)
          ? defaultCountryId
          : countries[0]?.id ?? '';
      setCountryId(initialCountry);
    } else {
      setName('');
      setSlug('');
      setCountryId('');
      setSlugManuallyEdited(false);
    }
  }, [open, countries, defaultCountryId]);

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
          <DialogTitle>Add New Region</DialogTitle>
          <DialogDescription>
            Create a new region to organize cities.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="region-name" className="block text-sm font-medium text-gray-700 mb-1.5">
              Region Name <span className="text-red-500">*</span>
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
              <SelectTrigger>
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
            {countries.length === 0 && (
              <p className="text-xs text-red-500 mt-1">
                Add a country before creating regions.
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
              {isSubmitting ? 'Creating...' : 'Create Region'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

