'use client';

import { useState } from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Eye } from 'lucide-react';
import { BulkActionsToolbar } from '@/components/admin/common/BulkActionsToolbar';

interface BlogsTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onSearchChange: (value: string) => void;
  searchValue?: string;
  onBulkExport?: (selectedRows: TData[]) => void;
  onBulkDelete?: (selectedRows: TData[]) => void;
}

export function BlogsTable<TData, TValue>({
  columns,
  data,
  onSearchChange,
  searchValue = '',
  onBulkExport,
  onBulkDelete,
}: BlogsTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows.map(row => row.original);
  const selectedCount = selectedRows.length;

  const handleExportCSV = () => {
    if (onBulkExport) {
      onBulkExport(selectedRows);
    } else {
      const headers = ['ID', 'Title', 'Slug', 'Author', 'Category', 'Status', 'Created At'];
      const rows = selectedRows.length > 0 
        ? selectedRows.map((row: any) => [
            row.id,
            row.title,
            row.slug,
            `${row.author?.firstName || ''} ${row.author?.lastName || ''}`,
            row.category?.name || '',
            row.status,
            new Date(row.createdAt).toLocaleDateString(),
          ])
        : data.map((row: any) => [
            row.id,
            row.title,
            row.slug,
            `${row.author?.firstName || ''} ${row.author?.lastName || ''}`,
            row.category?.name || '',
            row.status,
            new Date(row.createdAt).toLocaleDateString(),
          ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map((cell: any) => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `blogs-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    }
  };

  const handleBulkDelete = () => {
    if (onBulkDelete && selectedRows.length > 0) {
      onBulkDelete(selectedRows);
    }
  };

  return (
    <div className="space-y-4">
      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar
        selectedCount={selectedCount}
        onExportCSV={handleExportCSV}
        onBulkDelete={onBulkDelete ? handleBulkDelete : undefined}
        exportFileName="blogs"
      />

      {/* Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by title or content..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          disabled={selectedRows.length !== 1 || !(selectedRows[0] as any)?.slug}
          onClick={() => {
            const slug = (selectedRows[0] as any)?.slug;
            if (slug) {
              window.open(`/blog/${slug}`, '_blank');
            }
          }}
        >
          <Eye className="w-4 h-4" />
          View Blog
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-white dark:bg-gray-900">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="font-semibold text-gray-700 dark:text-gray-300">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-gray-500"
                >
                  No blogs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {selectedCount > 0 && (
            <>
              {table.getFilteredSelectedRowModel().rows.length} of{' '}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </>
          )}
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="h-8 w-[70px] rounded-md border border-gray-300 bg-transparent px-2 text-sm"
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              ←
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

