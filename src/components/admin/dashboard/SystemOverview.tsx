'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, MapPin, Layers, Shield } from 'lucide-react';

interface SystemOverviewProps {
  system: {
    totalCategories: number;
    totalCities: number;
    totalRegions: number;
    activeAdmins: number;
  };
}

export default function SystemOverview({ system }: SystemOverviewProps) {
  const stats = [
    {
      label: 'Cities',
      value: system.totalCities,
      icon: MapPin,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      label: 'Regions',
      value: system.totalRegions,
      icon: Layers,
      color: 'text-[#1c4233]',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
    {
      label: 'Categories',
      value: system.totalCategories,
      icon: Settings,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
    },
    {
      label: 'Active Admins',
      value: system.activeAdmins,
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="flex items-center gap-2 p-3 rounded-lg border hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                <div className={`${stat.bgColor} p-2 rounded-lg flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

