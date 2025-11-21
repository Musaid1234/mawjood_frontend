'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Star, MessageSquare, Calendar, User, Building2 } from 'lucide-react';
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

export type Review = {
  id: string;
  rating: number;
  comment: string;
  deleteRequestStatus?: string | null;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string | null;
  };
  business: {
    id: string;
    name: string;
    slug: string;
    logo?: string | null;
  };
};

export const createColumns = (
  onApprove: (reviewId: string) => void,
  onReject: (reviewId: string) => void,
  currentTab: string
): ColumnDef<Review>[] => [
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
    accessorKey: 'user',
    header: 'User',
    cell: ({ row }) => {
      const review = row.original;
      return (
        <div className="flex items-center gap-3">
          {review.user.avatar ? (
            <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={review.user.avatar}
                alt={`${review.user.firstName} ${review.user.lastName}`}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-gray-400" />
            </div>
          )}
          <div>
            <div className="font-semibold text-gray-900 dark:text-gray-100">
              {review.user.firstName} {review.user.lastName}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {review.user.email}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'business',
    header: 'Business',
    cell: ({ row }) => {
      const business = row.original.business;
      return (
        <div className="flex items-center gap-3">
          {business.logo ? (
            <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={business.logo}
                alt={business.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-gray-400" />
            </div>
          )}
          <div>
            <div className="font-semibold text-gray-900 dark:text-gray-100">
              {business.name}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'rating',
    header: 'Rating',
    cell: ({ row }) => {
      const rating = row.getValue('rating') as number;
      return (
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {rating}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'comment',
    header: 'Comment',
    cell: ({ row }) => {
      const comment = row.getValue('comment') as string;
      return (
        <div className="max-w-[300px]">
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
            {comment || 'No comment'}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: 'deleteRequestStatus',
    header: 'Delete Request',
    cell: ({ row }) => {
      const status = row.getValue('deleteRequestStatus') as string | null;
      if (!status) {
        return (
          <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
        );
      }
      const statusColors = {
        PENDING: 'bg-yellow-500',
        APPROVED: 'bg-green-500',
        REJECTED: 'bg-red-500',
      };
      return (
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${
              statusColors[status as keyof typeof statusColors] || statusColors.PENDING
            }`}
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
            {status.toLowerCase()}
          </span>
        </div>
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
      const review = row.original;

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

            {review.deleteRequestStatus === 'PENDING' && (
              <>
                <DropdownMenuItem
                  onClick={() => onApprove(review.id)}
                  className="text-green-600 focus:text-green-600 focus:bg-green-50"
                >
                  Approve Delete
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onReject(review.id)}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  Reject Delete
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}

            <DropdownMenuItem
              onClick={() => window.open(`/businesses/${review.business.slug}`, '_blank')}
            >
              View Business
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

