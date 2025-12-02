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

import { Country } from '@/services/city.service';

interface CountryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  country?: Country | null;
  onSave: (countryData: { name: string; slug: string; code?: string }) => Promise<void>;
}

export function CountryDialog({ open, onOpenChange, country, onSave }: CountryDialogProps) {
  const isEditMode = !!country;
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  useEffect(() => {
    if (open) {
      if (isEditMode && country) {
        setName(country.name || '');
        setSlug(country.slug || '');
        setCode(country.code || '');
        setSlugManuallyEdited(true);
      } else {
        setName('');
        setSlug('');
        setCode('');
        setSlugManuallyEdited(false);
      }
    } else {
      setName('');
      setSlug('');
      setCode('');
      setIsSubmitting(false);
      setSlugManuallyEdited(false);
    }
  }, [open, country, isEditMode]);

  const generateSlug = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

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

    const trimmedName = name.trim();
    const trimmedSlug = slug.trim();
    const trimmedCode = code.trim();

    if (!trimmedName || !trimmedSlug) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        name: trimmedName,
        slug: trimmedSlug,
        code: trimmedCode ? trimmedCode : undefined,
      });
      onOpenChange(false);
    } catch (error) {
      // error handled in parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Country' : 'Add New Country'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the country information below.' : 'Create a new country to organize regions and cities.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="country-name" className="block text-sm font-medium text-gray-700 mb-1.5">
              Country Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="country-name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g., Saudi Arabia"
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <label htmlFor="country-slug" className="block text-sm font-medium text-gray-700 mb-1.5">
              Slug <span className="text-red-500">*</span>
            </label>
            <Input
              id="country-slug"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="e.g., saudi-arabia"
              disabled={isSubmitting}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              URL-friendly version (lowercase, hyphens only)
            </p>
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Country' : 'Create Country')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


