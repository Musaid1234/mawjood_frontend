'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { businessService, Business } from '@/services/business.service';
import MyListingCard from './MyListingCard';
import { Building2, AlertCircle, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function MyListings() {
  const queryClient = useQueryClient();
  
  const { data: businesses, isLoading, error } = useQuery({
    queryKey: ['my-businesses'],
    queryFn: () => businessService.getMyBusinesses(),
  });

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
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Create Your First Listing</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 my-4">
      {/* Header Stats */}
      <div className="bg-primary rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Your Listings</h2>
            <p className="text-white/90">
              You have {businesses.length} {businesses.length === 1 ? 'listing' : 'listings'}
            </p>
          </div>
          <Link
            href="/dashboard/add-listing"
            className="flex items-center gap-2 px-4 py-2 bg-white text-primary rounded-lg hover:bg-white/90 transition-colors font-medium"
          >
            <PlusCircle className="w-5 h-5" />
            <span className="hidden sm:inline">Add New Listing</span>
          </Link>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="space-y-4">
        {businesses.map((business: Business) => (
          <MyListingCard
            key={business.id}
            business={business}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}