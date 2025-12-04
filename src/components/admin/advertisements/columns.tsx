'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Calendar, Eye, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import Image from 'next/image';

export type Advertisement = {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl?: string | null;
  openInNewTab?: boolean;
  adType?: 'CATEGORY' | 'TOP' | 'FOOTER' | 'BUSINESS_LISTING' | 'BLOG_LISTING' | 'HOMEPAGE';
  isActive: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  notes?: string | null;
  countryId?: string | null;
  regionId?: string | null;
  cityId?: string | null;
  categoryId?: string | null;
  createdAt: string;
  updatedAt: string;
  city?: { name: string; id: string } | null;
  region?: { name: string; id: string } | null;
  country?: { name: string; id: string } | null;
  category?: { name: string; id: string } | null;
};

const adTypeLabels: Record<string, string> = {
  CATEGORY: 'Category Sidebar',
  BUSINESS_LISTING: 'Business Listing',
  BLOG_LISTING: 'Blog Listing',
  HOMEPAGE: 'Homepage',
  TOP: 'Top Banner',
  FOOTER: 'Footer Banner',
};

export const createColumns = (
  onView: (ad: Advertisement) => void,
  onEdit: (adId: string) => void,
  onDelete: (adId: string) => void,
  onToggleActive: (adId: string, isActive: boolean) => void
): ColumnDef<Advertisement>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'imageUrl',
    header: 'Image',
    cell: ({ row }) => {
      const ad = row.original;
      return (
        <button
          onClick={() => onView(ad)}
          className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 hover:border-primary transition-colors cursor-pointer"
        >
          <Image
            src={ad.imageUrl}
            alt={ad.title}
            fill
            className="object-cover"
            sizes="64px"
          />
        </button>
      );
    },
  },
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => {
      const ad = row.original;
      return (
        <div>
          <div className="font-semibold text-gray-900 dark:text-gray-100">
            {ad.title}
          </div>
          {ad.targetUrl && (
            <a
              href={ad.targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3 h-3" />
              {ad.targetUrl.length > 30 ? ad.targetUrl.slice(0, 30) + '...' : ad.targetUrl}
            </a>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'adType',
    header: 'Type',
    cell: ({ row }) => {
      const adType = row.getValue('adType') as string;
      return (
        <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {adTypeLabels[adType] || adType}
        </div>
      );
    },
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.getValue('isActive') as boolean;
      return (
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'location',
    header: 'Location',
    cell: ({ row }) => {
      const ad = row.original;
      
      if (ad.city) {
        return <span className="text-sm text-gray-700 dark:text-gray-300">🏙️ {ad.city.name}</span>;
      } else if (ad.region) {
        return <span className="text-sm text-gray-700 dark:text-gray-300">🗺️ {ad.region.name}</span>;
      } else if (ad.country) {
        return <span className="text-sm text-gray-700 dark:text-gray-300">🌍 {ad.country.name}</span>;
      } else {
        return <span className="text-sm text-gray-500 dark:text-gray-400">Global</span>;
      }
    },
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => {
      const ad = row.original;
      return ad.category ? (
        <span className="text-sm text-gray-700 dark:text-gray-300">{ad.category.name}</span>
      ) : (
        <span className="text-sm text-gray-500 dark:text-gray-400">All</span>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'));
      return (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Calendar className="w-4 h-4" />
          {format(date, 'MMM dd, yyyy')}
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const ad = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onView(ad)}>
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(ad.id)}>
              Edit Advertisement
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuLabel className="text-xs font-normal text-gray-500">
              Update Status
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onToggleActive(ad.id, !ad.isActive)}>
              {ad.isActive ? 'Deactivate' : 'Activate'}
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem
              onClick={() => onDelete(ad.id)}
              className="text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              Delete Advertisement
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

