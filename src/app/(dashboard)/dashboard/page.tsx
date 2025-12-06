'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { analyticsService, DashboardResponse } from '@/services/analytics.service';
import DashboardStats from '@/components/dashboard/DashboardStats';
import ViewsChart from '@/components/dashboard/ViewsChart';
import RecentActivities from '@/components/dashboard/RecentActivities';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await analyticsService.getDashboardStats();
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1c4233]"></div>
      </div>
    );
  }

  const stats = data?.overview;

  return (
    <div className="space-y-4 sm:space-y-6 my-2 sm:my-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Here's what's happening with your listings today.
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <DashboardStats
          activeListings={stats.activeListings}
          totalViews={stats.totalViews}
          todayViews={stats.todayViews}
          totalFavourites={stats.totalFavourites}
          totalReviews={stats.totalReviews}
          averageRating={stats.averageRating}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <ViewsChart data={data?.viewsTrend || []} />
        </div>

        <div className="lg:col-span-1">
          <RecentActivities reviews={data?.recentReviews || []} />
        </div>
      </div>
    </div>
  );
}