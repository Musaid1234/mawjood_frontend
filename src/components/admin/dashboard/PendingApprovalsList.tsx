'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

// Safe date formatting function
const formatDateSafely = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'N/A';
    }
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
};

interface PendingApprovalsListProps {
  approvals: Array<{
    id: string;
    name: string;
    slug: string;
    status: string;
    createdAt: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
    category: {
      name: string;
    };
    city: {
      name: string;
    };
  }>;
}

export default function PendingApprovalsList({ approvals }: PendingApprovalsListProps) {
  if (approvals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Pending Approvals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-8">No pending approvals</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-600" />
          Pending Approvals
        </CardTitle>
        <Link
          href="/admin/businesses?tab=pending"
          className="text-sm text-[#1c4233] hover:underline font-medium"
        >
          View All →
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {approvals.map((approval) => (
            <div
              key={approval.id}
              className="flex items-start justify-between p-4 rounded-lg border hover:border-[#1c4233] hover:bg-green-50/50 dark:hover:bg-gray-800 transition-all group"
            >
              <div className="flex-1">
                <Link
                  href={`/admin/businesses?tab=pending`}
                  className="font-semibold text-gray-900 dark:text-gray-100 hover:text-[#1c4233] transition-colors"
                >
                  {approval.name}
                </Link>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  📍 {approval.city.name} • 📂 {approval.category.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  👤 {approval.user.firstName} {approval.user.lastName}
                </p>
              </div>
              <span className="text-xs text-amber-600 font-medium whitespace-nowrap bg-amber-50 dark:bg-amber-950 px-2 py-1 rounded-md">
                {formatDateSafely(approval.createdAt)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

