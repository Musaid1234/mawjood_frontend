'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CheckCircle, XCircle, Ban } from 'lucide-react';

interface BusinessStatusBreakdownProps {
  status: {
    pending: number;
    approved: number;
    rejected: number;
    suspended: number;
  };
}

export default function BusinessStatusBreakdown({ status }: BusinessStatusBreakdownProps) {
  const statuses = [
    {
      label: 'Pending',
      value: status.pending,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-950',
    },
    {
      label: 'Approved',
      value: status.approved,
      icon: CheckCircle,
      color: 'text-[#1c4233]',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
    {
      label: 'Rejected',
      value: status.rejected,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-950',
    },
    {
      label: 'Suspended',
      value: status.suspended,
      icon: Ban,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50 dark:bg-gray-800',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {statuses.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`${item.bgColor} p-2.5 rounded-lg`}>
                    <Icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{item.value}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

