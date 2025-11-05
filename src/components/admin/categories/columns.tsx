'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Calendar, Hash, FolderTree } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { Category } from '@/services/category.service';

type CategoryWithCount = Category & {
  _count?: {
    businesses: number;
    subcategories: number;
  };
};

export const createColumns = (
  onEdit: (category: CategoryWithCount) => void,
  onDelete: (categoryId: string) => void
): ColumnDef<CategoryWithCount>[] => [
  {
    accessorKey: 'name',
    header: 'Category',
    cell: ({ row }) => {
      const category = row.original;
      return (
        <div>
          <div className="font-semibold text-gray-900 dark:text-gray-100">
            {category.name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            /{category.slug}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => {
      const description = row.getValue('description') as string | null;
      return (
        <div className="text-sm text-gray-700 dark:text-gray-300 max-w-[300px] truncate">
          {description || 'No description'}
        </div>
      );
    },
  },
  {
    accessorKey: 'order',
    header: 'Order',
    cell: ({ row }) => {
      const order = row.getValue('order') as number;
      return (
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {order}
          </span>
        </div>
      );
    },
  },
  {
    id: 'subcategories',
    header: 'Subcategories',
    cell: ({ row }) => {
      const category = row.original as CategoryWithCount;
      const count = category._count?.subcategories || (category.subcategories ? category.subcategories.length : 0);
      return (
        <div className="flex items-center gap-2">
          <FolderTree className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {count}
          </span>
        </div>
      );
    },
  },
  {
    id: 'businesses',
    header: 'Businesses',
    cell: ({ row }) => {
      const category = row.original as CategoryWithCount;
      const count = category._count?.businesses || 0;
      return (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {count}
        </span>
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
      const category = row.original;

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
            <DropdownMenuItem onClick={() => onEdit(category)}>
              Edit Category
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(category.id)}
              className="text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              Delete Category
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
