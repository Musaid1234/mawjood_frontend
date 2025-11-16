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
import { City, Region } from '@/services/city.service';

interface CityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  city?: City | null;
  regions: Region[];
  onSave: (cityData: { name: string; slug: string; regionId: string }) => Promise<void>;
}

export function CityDialog({
  open,
  onOpenChange,
  city,
  regions,
  onSave,
}: CityDialogProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [regionId, setRegionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [regionSearch, setRegionSearch] = useState('');

  useEffect(() => {
    if (city) {
      setName(city.name);
      setSlug(city.slug);
      setRegionId(city.regionId);
    } else {
      setName('');
      setSlug('');
      setRegionId('');
    }
    setRegionSearch('');
  }, [city, open]);

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setName(value);
    if (!city) {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generatedSlug);
    }
  };

  const filteredRegions = regions.filter((region) =>
    region.name.toLowerCase().includes(regionSearch.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !slug.trim() || !regionId) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({ name: name.trim(), slug: slug.trim(), regionId });
      onOpenChange(false);
    } catch (err) {
      // Error handled in parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{city ? 'Edit City' : 'Add New City'}</DialogTitle>
          <DialogDescription>
            {city ? 'Update the city information below.' : 'Enter the details for the new city.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
              City Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g., Riyadh"
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1.5">
              Slug <span className="text-red-500">*</span>
            </label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g., riyadh"
              disabled={isSubmitting}
              required
              className={!city ? 'bg-gray-100' : ''}
            />
            <p className="text-xs text-gray-500 mt-1">
              URL-friendly version (lowercase, hyphens only)
            </p>
          </div>

          <div>
            <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1.5">
              Region <span className="text-red-500">*</span>
            </label>
            <Select value={regionId} onValueChange={setRegionId} disabled={isSubmitting}>
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue placeholder="Select a region" />
              </SelectTrigger>
              <SelectContent className="w-full max-w-xs max-h-60 overflow-y-auto">
                <div className="px-2 pb-2 pt-1 sticky top-0 bg-white dark:bg-gray-900">
                  <Input
                    placeholder="Search region..."
                    value={regionSearch}
                    onChange={(e) => setRegionSearch(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                {filteredRegions.map((region) => (
                  <SelectItem key={region.id} value={region.id}>
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              {isSubmitting ? 'Saving...' : city ? 'Update City' : 'Create City'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

