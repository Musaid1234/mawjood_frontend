'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Mail, Phone, Calendar } from 'lucide-react';
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

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'USER' | 'BUSINESS_OWNER' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  _count?: {
    businesses: number;
    reviews: number;
    favourites: number;
  };
};

export const createColumns = (
  onUpdateRole: (userId: string, role: string) => void,
  onUpdateStatus: (userId: string, status: string) => void,
  onDelete: (userId: string) => void,
  onEdit?: (userId: string) => void
): ColumnDef<User>[] => [
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
    header: 'Name',
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="font-semibold text-gray-900 dark:text-gray-100">
          {user.firstName} {user.lastName}
        </div>
      );
    },
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700 dark:text-gray-300">{user.email}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700 dark:text-gray-300">{user.phone}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const role = row.getValue('role') as string;
      const roleDisplay = role.replace('_', ' ');
      return (
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${
              role === 'ADMIN'
                ? 'bg-purple-500'
                : role === 'BUSINESS_OWNER'
                ? 'bg-blue-500'
                : 'bg-gray-400'
            }`}
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
            {roleDisplay.toLowerCase()}
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
        ACTIVE: 'bg-green-500',
        INACTIVE: 'bg-gray-400',
        SUSPENDED: 'bg-red-500',
      };
      return (
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${statusColors[status as keyof typeof statusColors] || statusColors.INACTIVE}`} />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
            {status.toLowerCase()}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: '_count',
    header: 'Businesses',
    cell: ({ row }) => {
      const count = row.original._count?.businesses || 0;
      return (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {count}
        </span>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Joined',
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
      const user = row.original;

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
            {onEdit && (
              <>
                <DropdownMenuItem onClick={() => onEdit(user.id)}>
                  Edit User
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuLabel className="text-xs font-normal text-gray-500">
              Update Role
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onUpdateRole(user.id, 'USER')}>
              Set as User
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onUpdateRole(user.id, 'BUSINESS_OWNER')}>
              Set as Business Owner
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onUpdateRole(user.id, 'ADMIN')}>
              Set as Admin
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuLabel className="text-xs font-normal text-gray-500">
              Update Status
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onUpdateStatus(user.id, 'ACTIVE')}>
              Set Active
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onUpdateStatus(user.id, 'INACTIVE')}>
              Set Inactive
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onUpdateStatus(user.id, 'SUSPENDED')}>
              Suspend User
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem
              onClick={() => onDelete(user.id)}
              className="text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];