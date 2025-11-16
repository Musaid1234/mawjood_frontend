'use client';

import { useEffect, useState, useRef } from 'react';
import { adminService } from '@/services/admin.service';
import { paymentService, Payment } from '@/services/payment.service';
import { subscriptionService, BusinessSubscription } from '@/services/subscription.service';
import { PaymentsTable } from '@/components/admin/transactions/PaymentsTable';
import { SubscriptionsTable } from '@/components/admin/transactions/SubscriptionsTable';
import { createPaymentColumns } from '@/components/admin/transactions/paymentColumns';
import { createSubscriptionColumns } from '@/components/admin/transactions/subscriptionColumns';
import { toast } from 'sonner';
import { Loader2, Receipt, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type TabType = 'payments' | 'subscriptions';

export default function TransactionsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [subscriptions, setSubscriptions] = useState<BusinessSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('payments');
  const [paymentSearchInput, setPaymentSearchInput] = useState('');
  const [subscriptionSearchInput, setSubscriptionSearchInput] = useState('');
  const [debouncedPaymentSearch, setDebouncedPaymentSearch] = useState('');
  const [debouncedSubscriptionSearch, setDebouncedSubscriptionSearch] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('');
  const [subscriptionStatusFilter, setSubscriptionStatusFilter] = useState<string>('');

  const paymentDebounceTimer = useRef<NodeJS.Timeout | null>(null);
  const subscriptionDebounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Debounce payment search
  useEffect(() => {
    if (paymentDebounceTimer.current) {
      clearTimeout(paymentDebounceTimer.current);
    }

    paymentDebounceTimer.current = setTimeout(() => {
      setDebouncedPaymentSearch(paymentSearchInput);
    }, 500);

    return () => {
      if (paymentDebounceTimer.current) {
        clearTimeout(paymentDebounceTimer.current);
      }
    };
  }, [paymentSearchInput]);

  // Debounce subscription search
  useEffect(() => {
    if (subscriptionDebounceTimer.current) {
      clearTimeout(subscriptionDebounceTimer.current);
    }

    subscriptionDebounceTimer.current = setTimeout(() => {
      setDebouncedSubscriptionSearch(subscriptionSearchInput);
    }, 500);

    return () => {
      if (subscriptionDebounceTimer.current) {
        clearTimeout(subscriptionDebounceTimer.current);
      }
    };
  }, [subscriptionSearchInput]);

  // Fetch payments
  useEffect(() => {
    if (activeTab === 'payments') {
      fetchPayments();
    }
  }, [activeTab, debouncedPaymentSearch, paymentStatusFilter]);

  // Fetch subscriptions
  useEffect(() => {
    if (activeTab === 'subscriptions') {
      fetchSubscriptions();
    }
  }, [activeTab, debouncedSubscriptionSearch, subscriptionStatusFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: 1,
        limit: 100,
      };

      if (paymentStatusFilter) {
        params.status = paymentStatusFilter;
      }

      const response = await adminService.getAllPayments(params);
      let filteredPayments = response.data.payments || [];

      // Client-side search filtering
      if (debouncedPaymentSearch) {
        const searchLower = debouncedPaymentSearch.toLowerCase();
        filteredPayments = filteredPayments.filter(
          (payment: Payment) =>
            payment.business?.name?.toLowerCase().includes(searchLower) ||
            payment.user?.email?.toLowerCase().includes(searchLower) ||
            payment.transactionId?.toLowerCase().includes(searchLower) ||
            `${payment.user?.firstName} ${payment.user?.lastName}`.toLowerCase().includes(searchLower)
        );
      }

      setPayments(filteredPayments);
    } catch (error: any) {
      console.error('Error fetching payments:', error);
      toast.error(error.message || 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: 1,
        limit: 100,
      };

      if (subscriptionStatusFilter) {
        params.status = subscriptionStatusFilter;
      }

      if (debouncedSubscriptionSearch) {
        params.search = debouncedSubscriptionSearch;
      }

      const response = await adminService.getAllSubscriptions(params);
      setSubscriptions(response.data.subscriptions || []);
    } catch (error: any) {
      console.error('Error fetching subscriptions:', error);
      toast.error(error.message || 'Failed to fetch subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSearchChange = (value: string) => {
    setPaymentSearchInput(value);
  };

  const handleSubscriptionSearchChange = (value: string) => {
    setSubscriptionSearchInput(value);
  };

  const paymentColumns = createPaymentColumns();
  const subscriptionColumns = createSubscriptionColumns();

  const tabs = [
    { id: 'payments', label: 'Payments', icon: Receipt },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
  ] as const;

  if (loading && payments.length === 0 && subscriptions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#1c4233]" />
      </div>
    );
  }

  return (
    <div className="py-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Transactions Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage all payments and subscriptions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#1c4233] rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Total Payments</p>
          <p className="text-3xl font-bold mt-1">{payments.length}</p>
        </div>
        <div className="bg-[#245240] rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Total Subscriptions</p>
          <p className="text-3xl font-bold mt-1">{subscriptions.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`relative py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-[#1c4233] text-[#1c4233] dark:border-green-400 dark:text-green-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        {activeTab === 'payments' ? (
          <>
            {/* Payment Status Filter */}
            <div className="mb-4">
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c4233] focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>
            <PaymentsTable
              columns={paymentColumns}
              data={payments}
              onSearchChange={handlePaymentSearchChange}
              searchValue={paymentSearchInput}
            />
          </>
        ) : (
          <>
            {/* Subscription Status Filter */}
            <div className="mb-4">
              <select
                value={subscriptionStatusFilter}
                onChange={(e) => setSubscriptionStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c4233] focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="EXPIRED">Expired</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
            <SubscriptionsTable
              columns={subscriptionColumns}
              data={subscriptions}
              onSearchChange={handleSubscriptionSearchChange}
              searchValue={subscriptionSearchInput}
            />
          </>
        )}
      </div>
    </div>
  );
}
