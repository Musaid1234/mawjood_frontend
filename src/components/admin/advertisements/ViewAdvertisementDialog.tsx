'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Advertisement } from './columns';
import Image from 'next/image';
import { format } from 'date-fns';
import { ExternalLink, Calendar, MapPin, Tag, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

interface ViewAdvertisementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  advertisement: Advertisement | null;
}

const adTypeLabels: Record<string, string> = {
  CATEGORY: 'Category Sidebar',
  BUSINESS_LISTING: 'Business Listing',
  BLOG_LISTING: 'Blog Listing',
  HOMEPAGE: 'Homepage',
  TOP: 'Top Banner',
  FOOTER: 'Footer Banner',
};

export function ViewAdvertisementDialog({
  open,
  onOpenChange,
  advertisement: ad,
}: ViewAdvertisementDialogProps) {
  if (!ad) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Advertisement Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image Preview */}
          <div className="relative w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
            <div className={`relative ${
              (ad.adType === 'CATEGORY' || ad.adType === 'BUSINESS_LISTING' || ad.adType === 'BLOG_LISTING')
                ? 'aspect-[300/350] max-w-[300px] mx-auto' 
                : 'aspect-[1278/184]'
            }`}>
              <Image
                src={ad.imageUrl}
                alt={ad.title}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 800px"
              />
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Title</label>
              <p className="mt-1 text-base font-semibold text-gray-900">{ad.title}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Advertisement Type</label>
              <p className="mt-1">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {ad.adType ? adTypeLabels[ad.adType] || ad.adType : 'Unknown'}
                </span>
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <p className="mt-1">
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                  ad.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {ad.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  {ad.isActive ? 'Active' : 'Inactive'}
                </span>
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Link Behavior</label>
              <p className="mt-1 text-base text-gray-900">
                {ad.openInNewTab !== false ? 'Opens in new tab' : 'Opens in same tab'}
              </p>
            </div>

            {ad.targetUrl && (
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-500">Target URL</label>
                <Link
                  href={ad.targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 flex items-center gap-2 text-blue-600 hover:underline break-all"
                >
                  <ExternalLink className="w-4 h-4 flex-shrink-0" />
                  {ad.targetUrl}
                </Link>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </label>
              <p className="mt-1 text-base text-gray-900">
                {ad.city?.name ? `🏙️ ${ad.city.name}` : 
                 ad.region?.name ? `🗺️ ${ad.region.name}` :
                 ad.country?.name ? `🌍 ${ad.country.name}` :
                 'Global'}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Category
              </label>
              <p className="mt-1 text-base text-gray-900">
                {ad.category?.name || 'All Categories'}
              </p>
            </div>

            {ad.startsAt && (
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Starts At
                </label>
                <p className="mt-1 text-base text-gray-900">
                  {format(new Date(ad.startsAt), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
            )}

            {ad.endsAt && (
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Ends At
                </label>
                <p className="mt-1 text-base text-gray-900">
                  {format(new Date(ad.endsAt), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Created At
              </label>
              <p className="mt-1 text-base text-gray-900">
                {format(new Date(ad.createdAt), 'MMM dd, yyyy HH:mm')}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Updated At
              </label>
              <p className="mt-1 text-base text-gray-900">
                {format(new Date(ad.updatedAt), 'MMM dd, yyyy HH:mm')}
              </p>
            </div>

            {ad.notes && (
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-500">Internal Notes</label>
                <p className="mt-1 text-base text-gray-900 whitespace-pre-wrap">
                  {ad.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

