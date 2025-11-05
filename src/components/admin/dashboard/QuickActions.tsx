'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Users, Building2, Settings, Folder, FolderOpen } from 'lucide-react';
import Link from 'next/link';

export default function QuickActions() {
  const actions = [
    {
      label: 'View Businesses',
      href: '/admin/businesses',
      icon: Building2,
      color: 'text-[#1c4233]',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
    {
      label: 'Manage Users',
      href: '/admin/users',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      label: 'Add Blog',
      href: '/admin/blogs/new',
      icon: Plus,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
    {
      label: 'View Categories',
      href: '/admin/categories',
      icon: FolderOpen,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-2">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                href={action.href}
                className="flex items-center gap-3 p-3 rounded-lg border hover:border-[#1c4233] hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group"
              >
                <div className={`${action.bgColor} p-2 rounded-lg group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-4 h-4 ${action.color}`} />
                </div>
                <span className="font-medium text-sm text-gray-700 dark:text-gray-300 group-hover:text-[#1c4233]">{action.label}</span>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

