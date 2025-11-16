'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Building2, User, Calendar, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Payment } from '@/services/payment.service';

export const createPaymentColumns = (): ColumnDef<Payment>[] => [
  {
    accessorKey: 'business',
    header: 'Business',
    cell: ({ row }) => {
      const business = row.original.business;
      return (
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {business?.name || 'Unknown Business'}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'user',
    header: 'User',
    cell: ({ row }) => {
      const user = row.original.user;
      return (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" />
          <div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {user ? `${user.firstName} ${user.lastName}` : 'Unknown User'}
            </div>
            {user && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {user.email}
              </div>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => {
      const payment = row.original;
      return (
        <div>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {payment.currency} {payment.amount.toFixed(2)}
          </span>
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
        COMPLETED: { bg: 'bg-green-500', icon: CheckCircle2 },
        PENDING: { bg: 'bg-yellow-500', icon: Clock },
        FAILED: { bg: 'bg-red-500', icon: XCircle },
        REFUNDED: { bg: 'bg-orange-500', icon: AlertCircle },
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
    accessorKey: 'paymentMethod',
    header: 'Payment Method',
    cell: ({ row }) => {
      const method = row.getValue('paymentMethod') as string;
      return (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {method || '-'}
        </span>
      );
    },
  },
  {
    accessorKey: 'transactionId',
    header: 'Transaction ID',
    cell: ({ row }) => {
      const transactionId = row.getValue('transactionId') as string;
      return (
        <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
          {transactionId || '-'}
        </span>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'));
      return (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Calendar className="w-4 h-4" />
          {format(date, 'MMM dd, yyyy')}
        </div>
      );
    },
  },
];

