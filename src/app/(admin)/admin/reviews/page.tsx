'use client';

import { useEffect, useState } from 'react';
import { adminService } from '@/services/admin.service';
import { ReviewsTable } from '@/components/admin/reviews/ReviewsTable';
import { createColumns, Review } from '@/components/admin/reviews/columns';
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
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type TabType = 'all' | 'pending' | 'rejected';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchInput, setSearchInput] = useState('');
  const [pendingCount, setPendingCount] = useState(0);
  const [totalReviewsCount, setTotalReviewsCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: 'approve' | 'reject' | null;
    reviewId: string | null;
  }>({ open: false, type: null, reviewId: null });

  // Fetch reviews when tab or searchInput change
  useEffect(() => {
    fetchReviews();
  }, [activeTab, searchInput]);

  // Fetch static stats once on mount
  useEffect(() => {
    fetchStaticStats();
  }, []);

  const fetchStaticStats = async () => {
    try {
      setStatsLoading(true);
      const [pendingResponse, allReviewsResponse, rejectedResponse] = await Promise.all([
        adminService.getPendingDeleteRequests({ limit: 1 }),
        adminService.getAllReviews({ limit: 1 }),
        adminService.getAllReviews({ deleteRequestStatus: 'REJECTED', limit: 1 }),
      ]);
      setPendingCount(pendingResponse.data.pagination?.total || 0);
      setTotalReviewsCount(allReviewsResponse.data.pagination?.total || 0);
      setRejectedCount(rejectedResponse.data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setSearchLoading(true);
      const params: any = {
        page: 1,
        limit: 100,
      };

      if (searchInput) {
        params.search = searchInput;
      }

      let response;
      if (activeTab === 'pending') {
        response = await adminService.getPendingDeleteRequests(params);
      } else {
        const statusMap: Record<string, string> = {
          all: '',
          rejected: 'REJECTED',
        };
        if (statusMap[activeTab]) {
          params.deleteRequestStatus = statusMap[activeTab];
        }
        response = await adminService.getAllReviews(params);
      }

      setReviews(response.data.reviews || []);
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      toast.error(error.message || 'Failed to fetch reviews');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleApprove = async (reviewId: string) => {
    try {
      await adminService.approveDeleteRequest(reviewId);
      toast.success('Delete request approved and review deleted successfully');
      fetchReviews();
      fetchStaticStats();
    } catch (error: any) {
      console.error('Error approving delete request:', error);
      toast.error(error.message || 'Failed to approve delete request');
    }
  };

  const handleReject = async () => {
    if (!actionDialog.reviewId) return;

    try {
      await adminService.rejectDeleteRequest(actionDialog.reviewId);
      toast.success('Delete request rejected successfully');
      setActionDialog({ open: false, type: null, reviewId: null });
      fetchReviews();
      fetchStaticStats();
    } catch (error: any) {
      console.error('Error rejecting delete request:', error);
      toast.error(error.message || 'Failed to reject delete request');
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  const columns = createColumns(
    (reviewId) => handleApprove(reviewId),
    (reviewId) => setActionDialog({ open: true, type: 'reject', reviewId }),
    activeTab
  );

  const tabs = [
    { id: 'all', label: 'All Reviews' },
    {
      id: 'pending',
      label: 'Pending Delete Requests',
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    { id: 'rejected', label: 'Rejected Requests' },
  ] as const;

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
      <div>
        <h1 className="text-3xl font-bold">Reviews Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage all reviews and delete requests
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1c4233] rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Total Reviews</p>
          <p className="text-3xl font-bold mt-1">{totalReviewsCount}</p>
        </div>
        <div className="bg-[#245240] rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Pending Delete Requests</p>
          <p className="text-3xl font-bold mt-1">{pendingCount}</p>
        </div>
        <div className="bg-[#2d624d] rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Rejected Requests</p>
          <p className="text-3xl font-bold mt-1">{rejectedCount}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`relative py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-[#1c4233] text-[#1c4233] dark:border-green-400 dark:text-green-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <span>{tab.label}</span>
              {'badge' in tab && tab.badge !== undefined && tab.badge > 0 && (
                <Badge
                  variant="destructive"
                  className="h-5 min-w-5 px-1.5 rounded-full flex items-center justify-center text-xs font-semibold"
                >
                  {tab.badge > 99 ? '99+' : tab.badge}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        <ReviewsTable
          columns={columns}
          data={reviews}
          onSearchChange={handleSearchChange}
          searchValue={searchInput}
          loading={searchLoading}
        />
      </div>

      {/* Reject Confirmation Dialog */}
      <AlertDialog
        open={actionDialog.open && actionDialog.type === 'reject'}
        onOpenChange={(open) =>
          !open && setActionDialog({ open: false, type: null, reviewId: null })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Delete Request?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this delete request? The review will remain visible and the user will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              className="bg-red-600 hover:bg-red-700"
            >
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

