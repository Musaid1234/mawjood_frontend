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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import { BulkActionsToolbar } from '@/components/admin/common/BulkActionsToolbar';

interface UsersTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onSearchChange: (value: string) => void;
  onRoleFilter: (value: string) => void;
  onStatusFilter: (value: string) => void;
  onBulkExport?: (selectedRows: TData[]) => void;
  onBulkDelete?: (selectedRows: TData[]) => void;
  onBulkStatusChange?: (selectedRows: TData[], status: string) => void;
}

export function UsersTable<TData, TValue>({
  columns,
  data,
  onSearchChange,
  onRoleFilter,
  onStatusFilter,
  onBulkExport,
  onBulkDelete,
  onBulkStatusChange,
}: UsersTableProps<TData, TValue>) {
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
      const headers = ['ID', 'Name', 'Email', 'Phone', 'Role', 'Status', 'Created At'];
      const rows = selectedRows.length > 0 
        ? selectedRows.map((row: any) => [
            row.id,
            `${row.firstName || ''} ${row.lastName || ''}`,
            row.email,
            row.phone || '',
            row.role,
            row.status,
            new Date(row.createdAt).toLocaleDateString(),
          ])
        : data.map((row: any) => [
            row.id,
            `${row.firstName || ''} ${row.lastName || ''}`,
            row.email,
            row.phone || '',
            row.role,
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
      link.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    }
  };

  const handleBulkDelete = () => {
    if (onBulkDelete && selectedRows.length > 0) {
      onBulkDelete(selectedRows);
    }
  };

  const handleBulkStatusChange = (status: string) => {
    if (onBulkStatusChange && selectedRows.length > 0) {
      onBulkStatusChange(selectedRows, status);
    }
  };

  return (
    <div className="space-y-4">
      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar
        selectedCount={selectedCount}
        onExportCSV={handleExportCSV}
        onBulkDelete={onBulkDelete ? handleBulkDelete : undefined}
        onBulkStatusChange={onBulkStatusChange ? handleBulkStatusChange : undefined}
        availableStatuses={[
          { value: 'ACTIVE', label: 'Activate' },
          { value: 'INACTIVE', label: 'Deactivate' },
          { value: 'SUSPENDED', label: 'Suspend' },
        ]}
        exportFileName="users"
      />

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by name, email, or phone..."
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select onValueChange={onRoleFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="USER">User</SelectItem>
            <SelectItem value="BUSINESS_OWNER">Business Owner</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={onStatusFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
            <SelectItem value="SUSPENDED">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                  className="h-24 text-center"
                >
                  No users found.
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
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

