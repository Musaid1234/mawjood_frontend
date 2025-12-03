'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface RecentUsersListProps {
  users: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    status: string;
    createdAt: string;
  }>;
}

const capitalizeFirstLetter = (str: string | null | undefined): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case 'ADMIN':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'BUSINESS_OWNER':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  }
};

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

export default function RecentUsersList({ users }: RecentUsersListProps) {
  // Safety check for users array
  if (!users || !Array.isArray(users) || users.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#1c4233]" />
            Recent Users
          </CardTitle>
          <Link href="/admin/users" className="text-sm text-[#1c4233] hover:underline font-medium">
            View All →
          </Link>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-8">No recent users</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-[#1c4233]" />
          Recent Users
        </CardTitle>
        <Link href="/admin/users" className="text-sm text-[#1c4233] hover:underline font-medium">
          View All →
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-start justify-between p-4 rounded-lg border hover:border-[#1c4233] hover:bg-green-50/50 dark:hover:bg-gray-800 transition-all group"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <div
                    className="font-semibold text-gray-900 dark:text-gray-100 hover:text-[#1c4233] transition-colors"
                  >
                    {capitalizeFirstLetter(user.firstName)} {capitalizeFirstLetter(user.lastName)}
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${getRoleBadgeColor(
                      user.role
                    )}`}
                  >
                    {user.role.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">✉️ {user.email}</p>
                <p className="text-xs text-gray-500 mt-1">📱 {user.phone}</p>
              </div>
              <span className="text-xs text-[#1c4233] font-medium whitespace-nowrap bg-green-50 dark:bg-green-950 px-2 py-1 rounded-md">
                {formatDateSafely(user.createdAt)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

