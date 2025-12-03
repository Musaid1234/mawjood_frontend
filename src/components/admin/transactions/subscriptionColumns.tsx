'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Building2, Calendar, CheckCircle2, XCircle, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { BusinessSubscription, parseDecimal } from '@/services/subscription.service';
import { Checkbox } from '@/components/ui/checkbox';

export const createSubscriptionColumns = (): ColumnDef<BusinessSubscription>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'business',
    header: 'Business',
    cell: ({ row }) => {
      const business = row.original.business;
      return (
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-gray-400" />
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {business?.name || 'Unknown Business'}
            </div>
            {business?.user && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {business.user.firstName} {business.user.lastName}
              </div>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'plan',
    header: 'Plan',
    cell: ({ row }) => {
      const plan = row.original.plan;
      return (
        <div>
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {plan?.name || 'Unknown Plan'}
          </div>
          {plan && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {plan.billingInterval} • {plan.intervalCount} {plan.intervalCount === 1 ? 'period' : 'periods'}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const statusColors = {
        ACTIVE: { bg: 'bg-green-500', icon: CheckCircle2 },
        PENDING: { bg: 'bg-yellow-500', icon: Clock },
        CANCELLED: { bg: 'bg-red-500', icon: XCircle },
        EXPIRED: { bg: 'bg-gray-500', icon: XCircle },
        FAILED: { bg: 'bg-red-500', icon: XCircle },
      };
      const config = statusColors[status as keyof typeof statusColors] || statusColors.PENDING;
      const Icon = config.icon;

      return (
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${config.bg}`} />
          <Icon className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
            {status.toLowerCase()}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'totalAmount',
    header: 'Amount',
    cell: ({ row }) => {
      const subscription = row.original;
      const plan = subscription.plan;
      const amount = subscription.totalAmount 
        ? parseDecimal(subscription.totalAmount)
        : (plan ? parseDecimal(plan.price) : 0);
      const currency = plan?.currency || 'SAR';
      return (
        <div>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {currency} {amount.toFixed(2)}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'startedAt',
    header: 'Start Date & Time',
    cell: ({ row }) => {
      const dateValue = row.getValue('startedAt');
      if (!dateValue) return <span className="text-gray-400">N/A</span>;
      const date = new Date(dateValue as string);
      if (isNaN(date.getTime())) return <span className="text-gray-400">Invalid Date</span>;
      return (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Calendar className="w-4 h-4" />
          <div>
            <div>{format(date, 'MMM dd, yyyy')}</div>
            <div className="text-xs text-gray-500">{format(date, 'hh:mm a')}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'endsAt',
    header: 'End Date & Time',
    cell: ({ row }) => {
      const dateValue = row.getValue('endsAt');
      if (!dateValue) return <span className="text-gray-400">N/A</span>;
      const date = new Date(dateValue as string);
      if (isNaN(date.getTime())) return <span className="text-gray-400">Invalid Date</span>;
      return (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Calendar className="w-4 h-4" />
          <div>
            <div>{format(date, 'MMM dd, yyyy')}</div>
            <div className="text-xs text-gray-500">{format(date, 'hh:mm a')}</div>
          </div>
        </div>
      );
    },
  },
];

