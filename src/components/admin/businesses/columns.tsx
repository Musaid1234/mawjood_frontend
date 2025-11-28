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

export type Business = {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
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
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                {business.name}
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
