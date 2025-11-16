'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { adminService } from '@/services/admin.service';
import { BusinessesTable } from '@/components/admin/businesses/BusinessesTable';
import { createColumns, Business } from '@/components/admin/businesses/columns';
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

type TabType = 'all' | 'pending' | 'suspended' | 'approved';

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [pendingCount, setPendingCount] = useState(0);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: 'approve' | 'reject' | 'suspend' | null;
    businessId: string | null;
  }>({ open: false, type: null, businessId: null });

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchInput]);

  useEffect(() => {
    fetchBusinesses();
  }, [activeTab, debouncedSearch]);

  useEffect(() => {
    fetchPendingCount();
  }, []);

  const fetchPendingCount = async () => {
    try {
      const response = await adminService.getPendingBusinesses({ limit: 1 });
      setPendingCount(response.data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching pending count:', error);
    }
  };

  // Sync active tab with URL (e.g. ?tab=pending)
  useEffect(() => {
    const tabParam = (searchParams.get('tab') as TabType | null) || 'all';
    const validTabs: TabType[] = ['all', 'pending', 'suspended', 'approved'];
    const nextTab = validTabs.includes(tabParam) ? tabParam : 'all';
    if (nextTab !== activeTab) {
      setActiveTab(nextTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);

    const params = new URLSearchParams(searchParams.toString());
    if (tab === 'all') {
      params.delete('tab');
    } else {
      params.set('tab', tab);
    }

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  };

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: 1,
        limit: 100,
      };

      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      let response;
      if (activeTab === 'pending') {
        response = await adminService.getPendingBusinesses(params);
      } else {
        const statusMap: Record<string, string> = {
          all: '',
          suspended: 'SUSPENDED',
          approved: 'APPROVED',
        };
        params.status = statusMap[activeTab];
        response = await adminService.getAllBusinesses(params);
      }

      setBusinesses(response.data.businesses || []);
      if (activeTab === 'pending') {
        setPendingCount(response.data.pagination?.total || 0);
      }
    } catch (error: any) {
      console.error('Error fetching businesses:', error);
      toast.error(error.message || 'Failed to fetch businesses');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (businessId: string) => {
    try {
      await adminService.approveBusiness(businessId);
      toast.success('Business approved successfully');
      fetchBusinesses();
      fetchPendingCount();
    } catch (error: any) {
      console.error('Error approving business:', error);
      toast.error(error.message || 'Failed to approve business');
    }
  };

  const handleReject = async () => {
    if (!actionDialog.businessId) return;

    try {
      await adminService.rejectBusiness(actionDialog.businessId);
      toast.success('Business rejected successfully');
      setActionDialog({ open: false, type: null, businessId: null });
      fetchBusinesses();
      fetchPendingCount();
    } catch (error: any) {
      console.error('Error rejecting business:', error);
      toast.error(error.message || 'Failed to reject business');
    }
  };

  const handleSuspend = async () => {
    if (!actionDialog.businessId) return;

    try {
      await adminService.suspendBusiness(actionDialog.businessId);
      toast.success('Business suspended successfully');
      setActionDialog({ open: false, type: null, businessId: null });
      fetchBusinesses();
    } catch (error: any) {
      console.error('Error suspending business:', error);
      toast.error(error.message || 'Failed to suspend business');
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  const columns = createColumns(
    (businessId) => handleApprove(businessId),
    (businessId) => setActionDialog({ open: true, type: 'reject', businessId }),
    (businessId) => setActionDialog({ open: true, type: 'suspend', businessId }),
    activeTab
  );

  const tabs = [
    { id: 'all', label: 'All Businesses' },
    {
      id: 'pending',
      label: 'Pending',
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    { id: 'suspended', label: 'Suspended' },
    { id: 'approved', label: 'Approved' },
  ] as const;

  if (loading && businesses.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#1c4233]" />
      </div>
    );
  }

  return (
    <div className="py-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Businesses Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage all businesses, approvals, and suspensions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#1c4233] rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Total Businesses</p>
          <p className="text-3xl font-bold mt-1">{businesses.length}</p>
        </div>
        <div className="bg-[#245240] rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Pending Approvals</p>
          <p className="text-3xl font-bold mt-1">{pendingCount}</p>
        </div>
        <div className="bg-[#2d624d] rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Approved</p>
          <p className="text-3xl font-bold mt-1">
            {businesses.filter((b) => b.status === 'APPROVED').length}
          </p>
        </div>
        <div className="bg-[#36725a] rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Suspended</p>
          <p className="text-3xl font-bold mt-1">
            {businesses.filter((b) => b.status === 'SUSPENDED').length}
          </p>
        </div>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as TabType)}
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

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        <BusinessesTable
          columns={columns}
          data={businesses}
          onSearchChange={handleSearchChange}
          searchValue={searchInput}
        />
      </div>

      <AlertDialog
        open={actionDialog.open && actionDialog.type === 'reject'}
        onOpenChange={(open) =>
          !open && setActionDialog({ open: false, type: null, businessId: null })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Business?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this business? This action will mark the business as
              rejected and notify the owner.
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

      <AlertDialog
        open={actionDialog.open && actionDialog.type === 'suspend'}
        onOpenChange={(open) =>
          !open && setActionDialog({ open: false, type: null, businessId: null })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend Business?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to suspend this business? This will hide it from public view
              until it's approved again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSuspend}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Suspend
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}