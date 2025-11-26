import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
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
import { MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { Blog } from '@/services/blog.service';

export const createColumns = (
  onEdit: (blog: Blog) => void,
  onDelete: (blogId: string) => void
): ColumnDef<Blog>[] => [
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
    accessorKey: 'image',
    header: 'Image',
    cell: ({ row }) => {
      const image = row.original.image;
      return image ? (
        <div className="relative w-16 h-16 rounded-lg overflow-hidden">
          <Image
            src={image}
            alt={row.original.title}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
          <span className="text-gray-400 text-xs">No image</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => (
      <div className="max-w-md">
        <Link
          href={`/blog/${row.original.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2 hover:text-blue-600"
        >
          {row.original.title}
        </Link>
      </div>
    ),
  },
  {
    accessorKey: 'author',
    header: 'Author',
    cell: ({ row }) => (
      <span className="text-sm text-gray-700 dark:text-gray-300">
        {row.original.author.firstName} {row.original.author.lastName}
      </span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const rawStatus = (row.original as any).status as 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | undefined;
      const fallbackStatus: 'DRAFT' | 'PUBLISHED' = row.original.published ? 'PUBLISHED' : 'DRAFT';
      const status = rawStatus || fallbackStatus;

      let label = 'Draft';
      let variant: 'default' | 'secondary' | 'outline' = 'secondary';

      if (status === 'PUBLISHED') {
        label = 'Published';
        variant = 'default';
      } else if (status === 'SCHEDULED') {
        label = 'Scheduled';
        variant = 'outline';
      }

      return <Badge variant={variant}>{label}</Badge>;
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => (
      <span className="text-sm text-gray-600">
        {format(new Date(row.original.createdAt), 'MMM dd, yyyy')}
      </span>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const blog = row.original;
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
            <DropdownMenuItem asChild>
              <Link
                href={`/blog/${blog.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center"
              >
                <Eye className="mr-2 h-4 w-4" />
                View
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(blog)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(blog.id)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

