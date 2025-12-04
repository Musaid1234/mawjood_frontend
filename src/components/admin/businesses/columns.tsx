'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Building2, MapPin, Calendar, User } from 'lucide-react';
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

// Safe date formatting utility
const formatDateSafely = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'N/A';
    }
    return format(date, 'MMM dd, yyyy');
  } catch (error) {
    return 'N/A';
  }
};

export type Business = {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  isVerified?: boolean;
  createdAt: string;
  logo?: string;
  category: {
    id: string;
    name: string;
  };
  city: {
    id: string;
    name: string;
    region?: {
      id?: string;
      name: string;
      countryId?: string;
    };
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
};

export const createColumns = (
  onApprove: (businessId: string) => void,
  onReject: (businessId: string) => void,
  onSuspend: (businessId: string) => void,
  onEdit: (businessId: string) => void,
  onToggleVerified: (businessId: string, isVerified: boolean) => void,
  currentTab: string
): ColumnDef<Business>[] => [
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
      accessorKey: 'name',
      header: 'Business',
      cell: ({ row }) => {
        const business = row.original;
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
              <div className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                {business.name}
                {business.isVerified && (
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div
                className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]"
                title={business.description?.replace(/<[^>]+>/g, '') || ''}
              >
                {business.description
                  ? (() => {
                    // Strip HTML tags
                    const plain = business.description.replace(/<[^>]+>/g, '');
                    // Trim to 80 chars
                    return plain.length > 80 ? plain.slice(0, 80) + '...' : plain;
                  })()
                  : ''}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'user',
      header: 'Owner',
      cell: ({ row }) => {
        const business = row.original;
        return (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {business.user.firstName} {business.user.lastName}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {business.user.email}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => {
        const category = row.original.category;
        return (
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {category?.name || 'N/A'}
          </span>
        );
      },
    },
    {
      accessorKey: 'city',
      header: 'Location',
      cell: ({ row }) => {
        const city = row.original.city;
        return (
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {city?.name || 'N/A'}
              {city?.region && (
                <span className="text-gray-500">, {city.region.name}</span>
              )}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        const statusColors = {
          APPROVED: 'bg-green-500',
          PENDING: 'bg-yellow-500',
          REJECTED: 'bg-red-500',
          SUSPENDED: 'bg-orange-500',
        };
        return (
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${statusColors[status as keyof typeof statusColors] || statusColors.PENDING
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
        const dateString = row.getValue('createdAt') as string;
        return (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            {formatDateSafely(dateString)}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const business = row.original;

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

              {business.status === 'PENDING' && (
                <>
                  <DropdownMenuItem
                    onClick={() => onApprove(business.id)}
                    className="text-green-600 focus:text-green-600 focus:bg-green-50"
                  >
                    Approve Business
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onReject(business.id)}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    Reject Business
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}

              {business.status === 'APPROVED' && (
                <>
                  <DropdownMenuItem
                    onClick={() => onToggleVerified(business.id, !business.isVerified)}
                    className={business.isVerified 
                      ? "text-yellow-600 focus:text-yellow-600 focus:bg-yellow-50"
                      : "text-green-600 focus:text-green-600 focus:bg-green-50"
                    }
                  >
                    {business.isVerified ? 'Remove Verified Tag' : 'Set as Verified'}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onSuspend(business.id)}
                    className="text-orange-600 focus:text-orange-600 focus:bg-orange-50"
                  >
                    Suspend Business
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}

              {business.status === 'SUSPENDED' && (
                <>
                  <DropdownMenuItem
                    onClick={() => onApprove(business.id)}
                    className="text-green-600 focus:text-green-600 focus:bg-green-50"
                  >
                    Approve Business
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}

              {business.status === 'REJECTED' && (
                <>
                  <DropdownMenuItem
                    onClick={() => onApprove(business.id)}
                    className="text-green-600 focus:text-green-600 focus:bg-green-50"
                  >
                    Re-approve Business
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}

              <DropdownMenuItem
                onClick={() => onEdit(business.id)}
                className="text-blue-600 focus:text-blue-600 focus:bg-blue-50"
              >
                Edit Business
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => window.open(`/businesses/${business.slug}`, '_blank')}
              >
                View Business
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
