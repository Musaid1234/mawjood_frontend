'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { advertisementService } from '@/services/advertisement.service';
import { AdvertisementsTable } from '@/components/admin/advertisements/AdvertisementsTable';
import { createColumns, Advertisement } from '@/components/admin/advertisements/columns';
import { ViewAdvertisementDialog } from '@/components/admin/advertisements/ViewAdvertisementDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdvertisementsListPage() {
  const router = useRouter();
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [allAdvertisements, setAllAdvertisements] = useState<Advertisement[]>([]); // For stats
  const [statsLoading, setStatsLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({
    adType: '',
    isActive: '',
  });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    adId: string | null;
  }>({ open: false, adId: null });
  const [viewDialog, setViewDialog] = useState<{
    open: boolean;
    advertisement: Advertisement | null;
  }>({ open: false, advertisement: null });

  // Fetch all advertisements for stats (unfiltered) - only on mount and after mutations
  useEffect(() => {
    const fetchAllAds = async () => {
      try {
        setStatsLoading(true);
        const response = await advertisementService.getAllAdvertisements({ page: 1, limit: 1000 });
        setAllAdvertisements(response.advertisements || []);
      } catch (error: any) {
        console.error('Error fetching all advertisements:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchAllAds();
  }, []); // Only fetch on mount

  // Fetch advertisements when filters or searchInput change
  useEffect(() => {
    const fetchAds = async () => {
      try {
        setSearchLoading(true);
        const params: any = {
          page: 1,
          limit: 100,
        };

        if (searchInput) params.search = searchInput;
        if (filters.adType && filters.adType !== 'all') params.adType = filters.adType;
        if (filters.isActive && filters.isActive !== 'all') params.isActive = filters.isActive;

        const response = await advertisementService.getAllAdvertisements(params);
        setAdvertisements(response.advertisements || []);
      } catch (error: any) {
        console.error('Error fetching advertisements:', error);
        toast.error(error.message || 'Failed to fetch advertisements');
      } finally {
        setSearchLoading(false);
      }
    };

    fetchAds();
  }, [searchInput, filters.adType, filters.isActive]);

  const refetchAll = useCallback(async () => {
    // Refetch all for stats
    const allResponse = await advertisementService.getAllAdvertisements({ page: 1, limit: 1000 });
    setAllAdvertisements(allResponse.advertisements || []);
    
    // Refetch filtered
    const params: any = { page: 1, limit: 100 };
    if (searchInput) params.search = searchInput;
    if (filters.adType && filters.adType !== 'all') params.adType = filters.adType;
    if (filters.isActive && filters.isActive !== 'all') params.isActive = filters.isActive;
    const response = await advertisementService.getAllAdvertisements(params);
    setAdvertisements(response.advertisements || []);
  }, [searchInput, filters.adType, filters.isActive]);

  const handleToggleActive = async (adId: string, isActive: boolean) => {
    try {
      await advertisementService.toggleAdvertisementStatus(adId, isActive);
      toast.success(`Advertisement ${isActive ? 'activated' : 'deactivated'} successfully`);
      await refetchAll();
    } catch (error: any) {
      console.error('Error toggling advertisement status:', error);
      toast.error(error.message || 'Failed to update advertisement status');
    }
  };

  const handleDeleteAd = async () => {
    if (!deleteDialog.adId) return;

    try {
      await advertisementService.deleteAdvertisement(deleteDialog.adId);
      toast.success('Advertisement deleted successfully');
      setDeleteDialog({ open: false, adId: null });
      await refetchAll();
    } catch (error: any) {
      console.error('Error deleting advertisement:', error);
      toast.error(error.message || 'Failed to delete advertisement');
    }
  };

  const handleView = (ad: Advertisement) => {
    setViewDialog({ open: true, advertisement: ad });
  };

  const handleEdit = (adId: string) => {
    router.push(`/admin/advertisements/edit/${adId}`);
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  const handleAdTypeFilter = (value: string) => {
    setFilters((prev) => ({ ...prev, adType: value }));
  };

  const handleStatusFilter = (value: string) => {
    setFilters((prev) => ({ ...prev, isActive: value }));
  };

  const columns = createColumns(
    handleView,
    handleEdit,
    (adId) => setDeleteDialog({ open: true, adId }),
    handleToggleActive
  );

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#1c4233]" />
      </div>
    );
  }

  return (
    <div className="py-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advertisements Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage all advertisements, banners, and promotional content
          </p>
        </div>
        <Button
          onClick={() => router.push('/admin/advertisements')}
          className="bg-[#1c4233] hover:bg-[#1c4233]/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Advertisement
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#1c4233] rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Total Advertisements</p>
          <p className="text-3xl font-bold mt-1">{allAdvertisements.length}</p>
        </div>
        <div className="bg-[#245240] rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Active</p>
          <p className="text-3xl font-bold mt-1">
            {allAdvertisements.filter((ad) => ad.isActive).length}
          </p>
        </div>
        <div className="bg-[#2d624d] rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Homepage Ads</p>
          <p className="text-3xl font-bold mt-1">
            {allAdvertisements.filter((ad) => ad.adType === 'HOMEPAGE').length}
          </p>
        </div>
        <div className="bg-[#36725a] rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Category Ads</p>
          <p className="text-3xl font-bold mt-1">
            {allAdvertisements.filter((ad) => ad.adType === 'CATEGORY').length}
          </p>
        </div>
      </div>

      {/* Advertisements Table */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        <AdvertisementsTable
          columns={columns}
          data={advertisements}
          onSearchChange={handleSearchChange}
          onAdTypeFilter={handleAdTypeFilter}
          onStatusFilter={handleStatusFilter}
          loading={searchLoading}
        />
      </div>

      {/* View Dialog */}
      <ViewAdvertisementDialog
        open={viewDialog.open}
        onOpenChange={(open) => setViewDialog({ open, advertisement: null })}
        advertisement={viewDialog.advertisement}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, adId: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the advertisement
              and remove it from all pages where it's displayed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAd}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

