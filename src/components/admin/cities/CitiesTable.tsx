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
import { Search, ChevronDown } from 'lucide-react';
import { BulkActionsToolbar } from '@/components/admin/common/BulkActionsToolbar';
import { useMemo, useRef, useEffect } from 'react';

interface CitiesTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onSearchChange: (value: string) => void;
  onRegionFilter: (value: string) => void;
  onCountryFilter?: (value: string) => void;
  searchValue?: string;
  regions: Array<{ id: string; name: string }>;
  countries?: Array<{ id: string; name: string }>;
  selectedCountry?: string;
  onBulkExport?: (selectedRows: TData[]) => void;
  onBulkDelete?: (selectedRows: TData[]) => void;
}

export function CitiesTable<TData, TValue>({
  columns,
  data,
  onSearchChange,
  onRegionFilter,
  onCountryFilter,
  searchValue = '',
  regions,
  countries = [],
  selectedCountry = 'all',
  onBulkExport,
  onBulkDelete,
}: CitiesTableProps<TData, TValue>) {
  const [countrySearch, setCountrySearch] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const countrySearchInputRef = useRef<HTMLInputElement>(null);

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

  // Filter countries based on search
  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) {
      return countries;
    }
    const searchLower = countrySearch.toLowerCase();
    return countries.filter((country) =>
      country.name.toLowerCase().includes(searchLower)
    );
  }, [countries, countrySearch]);

  // Close country dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target as Node)
      ) {
        setCountryDropdownOpen(false);
        setCountrySearch('');
      }
    };

    if (countryDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => {
        countrySearchInputRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [countryDropdownOpen]);

  const handleExportCSV = () => {
    if (onBulkExport) {
      onBulkExport(selectedRows);
    } else {
      const headers = ['ID', 'Name', 'Slug', 'State', 'Created At'];
      const rows = selectedRows.length > 0 
        ? selectedRows.map((row: any) => [
            row.id,
            row.name,
            row.slug,
            row.region?.name || '',
            new Date(row.createdAt).toLocaleDateString(),
          ])
        : data.map((row: any) => [
            row.id,
            row.name,
            row.slug,
            row.region?.name || '',
            new Date(row.createdAt).toLocaleDateString(),
          ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map((cell: any) => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `cities-${new Date().toISOString().split('T')[0]}.csv`;
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
        exportFileName="cities"
      />

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by city name..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {onCountryFilter && (
          <div className="relative" ref={countryDropdownRef}>
            <button
              type="button"
              onClick={() => setCountryDropdownOpen((prev) => !prev)}
              className="w-full md:w-[200px] rounded-lg border border-gray-300 bg-white px-3 py-2 flex items-center justify-between text-sm font-medium hover:bg-gray-50"
            >
              <span>
                {selectedCountry === 'all'
                  ? 'All Countries'
                  : countries.find((c) => c.id === selectedCountry)?.name || 'All Countries'}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>
            {countryDropdownOpen && (
              <div className="absolute z-50 mt-2 w-full md:w-[200px] rounded-lg border border-gray-200 bg-white shadow-lg">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
                  <Search className="h-4 w-4 text-gray-400" />
                  <input
                    ref={countrySearchInputRef}
                    type="text"
                    placeholder="Search country..."
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    className="w-full bg-transparent text-sm focus:outline-none"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto">
                  <button
                    type="button"
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 ${
                      selectedCountry === 'all' ? 'bg-gray-100 font-medium' : ''
                    }`}
                    onClick={() => {
                      onCountryFilter('all');
                      setCountryDropdownOpen(false);
                      setCountrySearch('');
                    }}
                  >
                    All Countries
                  </button>
                  {filteredCountries.map((country) => (
                    <button
                      key={country.id}
                      type="button"
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 ${
                        selectedCountry === country.id ? 'bg-gray-100 font-medium' : ''
                      }`}
                      onClick={() => {
                        onCountryFilter(country.id);
                        setCountryDropdownOpen(false);
                        setCountrySearch('');
                      }}
                    >
                      {country.name}
                    </button>
                  ))}
                  {!filteredCountries.length && (
                    <p className="px-3 py-2 text-sm text-gray-500">No results found</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <Select onValueChange={onRegionFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filter by States" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            {regions.map((region) => (
              <SelectItem key={region.id} value={region.id}>
                {region.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
                  No cities found.
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

