'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { businessService, Business } from '@/services/business.service';
import MyListingCard from './MyListingCard';
import { Building2, AlertCircle, PlusCircle, Search, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useState, useMemo } from 'react';

export default function MyListings() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: businesses, isLoading, error } = useQuery({
    queryKey: ['my-businesses'],
    queryFn: () => businessService.getMyBusinesses(),
  });

  // Filter businesses by search term
  const filteredBusinesses = useMemo(() => {
    if (!businesses) return [];
    if (!searchTerm.trim()) return businesses;
    
    const searchLower = searchTerm.toLowerCase();
    return businesses.filter((business) =>
      business.name.toLowerCase().includes(searchLower)
    );
  }, [businesses, searchTerm]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => businessService.deleteBusiness(id),
    onSuccess: () => {
      toast.success('Business listing deleted successfully!');
      // Refetch the list after deletion
      queryClient.invalidateQueries({ queryKey: ['my-businesses'] });
    },
    onError: (error: any) => {
      console.error('Delete business error:', error);
      toast.error(error?.message || 'Failed to delete business listing');
    },
  });

  const handleDelete = async (id: string) => {
    toast('Are you sure you want to delete this listing?', {
      action: {
        label: 'Delete',
        onClick: () => deleteMutation.mutate(id),
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {},
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-600">Loading your listings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="bg-red-50 rounded-full p-4 mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Failed to load listings
        </h3>
        <p className="text-gray-600 mb-4">
          {error instanceof Error ? error.message : 'Something went wrong'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!businesses || businesses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="bg-primary/10 rounded-full p-6 mb-4">
          <Building2 className="w-12 h-12 text-primary" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          No listings yet
        </h3>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          Start growing your business by creating your first listing. 
          It only takes a few minutes!
        </p>
        <Link
          href="/dashboard/add-listing"
          className="flex items-center gap-2 px-6 py-3 bg-[#1c4233] hover:bg-[#245240] text-white rounded-lg font-semibold transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Create Your First Listing</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 my-5">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
          <p className="text-gray-600 mt-1">
            Manage all your business listings
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#1c4233] text-white">
              {searchTerm ? filteredBusinesses.length : businesses.length} {searchTerm ? (filteredBusinesses.length === 1 ? 'Listing' : 'Listings') : (businesses.length === 1 ? 'Listing' : 'Listings')}
            </span>
          </p>
        </div>
        <Link
          href="/dashboard/add-listing"
          className="flex items-center gap-2 px-6 py-3 bg-[#1c4233] hover:bg-[#245240] text-white rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
        >
          <PlusCircle className="w-5 h-5" />
          Add New Listing
        </Link>
      </div>

      {/* Search */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by business name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c4233] focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Listings Grid */}
      {filteredBusinesses.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm
              ? 'Try adjusting your search criteria.'
              : 'No listings match your criteria.'}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-[#1c4233] hover:text-[#245240] font-medium"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBusinesses.map((business: Business) => (
            <MyListingCard
              key={business.id}
              business={business}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}