'use client';

import { Users, Building2, Star, CreditCard } from 'lucide-react';

interface StatsOverviewProps {
  stats: {
    totalUsers: number;
    totalBusinesses: number;
    totalReviews: number;
    totalPayments: number;
  };
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
  const statCards = [
    {
      title: 'Total Businesses',
      value: stats.totalBusinesses,
      icon: Building2,
      bgColor: 'bg-[#1c4233]',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      bgColor: 'bg-[#245240]',
    },
    {
      title: 'Total Reviews',
      value: stats.totalReviews,
      icon: Star,
      bgColor: 'bg-[#2d624d]',
    },
    {
      title: 'Total Payments',
      value: stats.totalPayments,
      icon: CreditCard,
      bgColor: 'bg-[#36725a]',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className={`${stat.bgColor} rounded-lg p-6 text-white`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-2">{stat.title}</p>
                <p className="text-3xl font-bold">{stat.value.toLocaleString()}</p>
              </div>
              <Icon className="w-10 h-10 opacity-80" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

