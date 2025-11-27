'use client';

import { useEffect, useState } from 'react';
import { adminService, DashboardStats } from '@/services/admin.service';
import {
  StatsOverview,
  BusinessStatusBreakdown,
  BusinessGrowthChart,
  BusinessByCategoryChart,
  BusinessByCityChart,
  PendingApprovalsList,
  RecentUsersList,
  SystemOverview,
  QuickActions,
} from '@/components/admin/dashboard';
import { Loader2 } from 'lucide-react';

export default function AdminPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getDashboardStats();
      setStats(response.data);
    } catch (err: any) {
      console.error('Error fetching dashboard stats:', err);
      setError(err.message || 'Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">{error || 'Failed to load dashboard'}</p>
        <button
          onClick={fetchDashboardStats}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="py-2 sm:py-4 space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
          Welcome back! Here&apos;s what&apos;s happening with your platform.
        </p>
      </div>

      {/* Stats Overview - 4 Cards */}
      <StatsOverview stats={stats.overview} />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2 columns wide */}
        <div className="lg:col-span-2 space-y-6">
          {/* Business Growth Chart */}
          <BusinessGrowthChart data={stats.charts.businessGrowth} />

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BusinessByCategoryChart data={stats.charts.businessesByCategory} />
            <BusinessByCityChart data={stats.charts.businessesByCity} />
          </div>

          {/* Pending Approvals */}
          <PendingApprovalsList approvals={stats.pendingApprovals} />

          {/* Recent Users */}
          <RecentUsersList users={stats.recentUsers} />
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Business Status Breakdown */}
          <BusinessStatusBreakdown status={stats.businessStatus} />

          {/* System Overview */}
          <SystemOverview system={stats.system} />

          {/* Quick Actions */}
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
