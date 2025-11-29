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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Search, X, Check, ChevronsUpDown } from 'lucide-react';
import { BulkActionsToolbar } from '@/components/admin/common/BulkActionsToolbar';
import { Category } from '@/services/category.service';
import { Country, Region, City } from '@/services/city.service';
import { cn } from '@/lib/utils';

interface BusinessesTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onSearchChange: (value: string) => void;
  searchValue?: string;
  onBulkExport?: (selectedRows: TData[]) => void;
  onBulkDelete?: (selectedRows: TData[]) => void;
  onBulkStatusChange?: (selectedRows: TData[], status: string) => void;
  selectedCategory?: string;
  selectedCountry?: string;
  selectedRegion?: string;
  selectedCity?: string;
  categories?: Category[];
  countries?: Country[];
  regions?: Region[];
  cities?: City[];
  loadingFilters?: boolean;
  onCategoryChange?: (value: string) => void;
  onCountryChange?: (value: string) => void;
  onRegionChange?: (value: string) => void;
  onCityChange?: (value: string) => void;
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
}

export function BusinessesTable<TData, TValue>({
  columns,
  data,
  onSearchChange,
  searchValue = '',
  onBulkExport,
  onBulkDelete,
  onBulkStatusChange,
  selectedCategory = 'all',
  selectedCountry = 'all',
  selectedRegion = 'all',
  selectedCity = 'all',
  categories = [],
  countries = [],
  regions = [],
  cities = [],
  loadingFilters = false,
  onCategoryChange,
  onCountryChange,
  onRegionChange,
  onCityChange,
  onClearFilters,
  hasActiveFilters = false,
}: BusinessesTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [categorySearch, setCategorySearch] = useState('');
  const [categoryOpen, setCategoryOpen] = useState(false);

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
      // Default CSV export
      const headers = ['ID', 'Name', 'Owner', 'Category', 'City', 'Status', 'Created At'];
      const rows = selectedRows.length > 0 
        ? selectedRows.map((row: any) => [
            row.id,
            row.name,
            `${row.user?.firstName || ''} ${row.user?.lastName || ''}`,
            row.category?.name || '',
            row.city?.name || '',
            row.status,
            new Date(row.createdAt).toLocaleDateString(),
          ])
        : data.map((row: any) => [
            row.id,
            row.name,
            `${row.user?.firstName || ''} ${row.user?.lastName || ''}`,
            row.category?.name || '',
            row.city?.name || '',
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
      link.download = `businesses-${new Date().toISOString().split('T')[0]}.csv`;
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
          { value: 'APPROVED', label: 'Approve' },
          { value: 'SUSPENDED', label: 'Suspend' },
          { value: 'REJECTED', label: 'Reject' },
        ]}
        exportFileName="businesses"
      />

      {/* Filters */}
      <div className="relative flex-block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by business name, owner, or location..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
            className="pl-10"
          />
        </div>
      <div className="flex flex-col md:flex-row gap-4">


        {onCategoryChange && (
          <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={categoryOpen}
                className="w-full md:w-[180px] justify-between"
                disabled={loadingFilters}
              >
                {selectedCategory === 'all'
                  ? 'All Categories'
                  : categories.find((cat) => cat.id === selectedCategory)?.name || 'Select category...'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0" align="start">
              <div className="flex items-center border-b px-3">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <Input
                  placeholder="Search categories..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                />
              </div>
              <div className="max-h-[300px] overflow-y-auto p-1">
                <div
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                  onClick={() => {
                    onCategoryChange('all');
                    setCategoryOpen(false);
                    setCategorySearch('');
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedCategory === 'all' ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  All Categories
                </div>
                {categories
                  .filter((category) =>
                    category.name.toLowerCase().includes(categorySearch.toLowerCase())
                  )
                  .map((category) => (
                    <div
                      key={category.id}
                      className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                      onClick={() => {
                        onCategoryChange(category.id);
                        setCategoryOpen(false);
                        setCategorySearch('');
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          selectedCategory === category.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      {category.name}
                    </div>
                  ))}
                {categories.filter((category) =>
                  category.name.toLowerCase().includes(categorySearch.toLowerCase())
                ).length === 0 && (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    No categories found.
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {onCountryChange && (
          <Select
            value={selectedCountry}
            onValueChange={onCountryChange}
            disabled={loadingFilters}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="All Countries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {countries.map((country) => (
                <SelectItem key={country.id} value={country.id}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {onRegionChange && (
          <Select
            value={selectedRegion}
            onValueChange={onRegionChange}
            disabled={loadingFilters || selectedCountry === 'all'}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="All States" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {regions
                .filter((region) => selectedCountry === 'all' || region.countryId === selectedCountry)
                .map((region) => (
                  <SelectItem key={region.id} value={region.id}>
                    {region.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        )}

        {onCityChange && (
          <Select
            value={selectedCity}
            onValueChange={onCityChange}
            disabled={loadingFilters || selectedRegion === 'all'}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities
                .filter((city) => {
                  if (selectedRegion !== 'all') {
                    return city.regionId === selectedRegion;
                  }
                  if (selectedCountry !== 'all') {
                    const region = regions.find((r) => r.id === city.regionId);
                    return region?.countryId === selectedCountry;
                  }
                  return true;
                })
                .map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        )}

        {hasActiveFilters && onClearFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="gap-2"
          >
            <X className="w-4 h-4" />
            Clear
          </Button>
        )}
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
                  No businesses found.
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
