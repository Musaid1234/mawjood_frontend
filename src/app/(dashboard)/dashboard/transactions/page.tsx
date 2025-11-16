'use client';

import { useQuery } from '@tanstack/react-query';
import { businessService } from '@/services/business.service';
import { subscriptionService } from '@/services/subscription.service';
import { paymentService } from '@/services/payment.service';
import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Receipt, CreditCard, Calendar, Building2, Loader2, AlertCircle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';
import { parseDecimal } from '@/services/subscription.service';

export default function TransactionsPage() {
  const { currency } = useCurrency();
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');

  // Fetch user's businesses
  const { data: businesses, isLoading: businessesLoading } = useQuery({
    queryKey: ['my-businesses'],
    queryFn: () => businessService.getMyBusinesses(),
  });

  // Fetch subscriptions for all businesses (backend will filter by user's businesses)
  const { data: subscriptionsData, isLoading: subscriptionsLoading } = useQuery({
    queryKey: ['subscriptions', selectedBusinessId],
    queryFn: () => subscriptionService.getSubscriptions({
      businessId: selectedBusinessId || undefined,
      limit: 100,
    }),
    enabled: !!businesses && businesses.length > 0,
  });

  // Fetch payments for all businesses
  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['payments', selectedBusinessId],
    queryFn: async () => {
      if (selectedBusinessId) {
        return paymentService.getBusinessPayments(selectedBusinessId);
      }
      // Get payments for all businesses
      const allPayments = await Promise.all(
        (businesses || []).map(business => 
          paymentService.getBusinessPayments(business.id).catch(() => [])
        )
      );
      return allPayments.flat();
    },
    enabled: !!businesses && businesses.length > 0,
  });

  const subscriptions = subscriptionsData?.data?.subscriptions || [];
  const allPayments = payments || [];

  // Filter subscriptions and payments by selected business
  const filteredSubscriptions = useMemo(() => {
    if (!selectedBusinessId) return subscriptions;
    return subscriptions.filter(sub => sub.businessId === selectedBusinessId);
  }, [subscriptions, selectedBusinessId]);

  const filteredPayments = useMemo(() => {
    if (!selectedBusinessId) return allPayments;
    return allPayments.filter(payment => payment.businessId === selectedBusinessId);
  }, [allPayments, selectedBusinessId]);

  const isLoading = businessesLoading || subscriptionsLoading || paymentsLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#1c4233]" />
        <p className="mt-4 text-gray-600">Loading transactions...</p>
      </div>
    );
  }

  if (!businesses || businesses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="bg-primary/10 rounded-full p-6 mb-4">
          <Building2 className="w-12 h-12 text-primary" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          No businesses found
        </h3>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          You need to create a business first to view transactions.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; icon: any }> = {
      ACTIVE: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle2 },
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      COMPLETED: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle2 },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
      EXPIRED: { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle },
      FAILED: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
      REFUNDED: { bg: 'bg-orange-100', text: 'text-orange-800', icon: AlertCircle },
    };

    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: Clock };
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6 my-5">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transactions & Billing</h1>
          <p className="text-gray-600 mt-1">
            Manage subscriptions and payments for your businesses
          </p>
        </div>
      </div>

      {/* Business Filter */}
      {businesses.length > 1 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Business
          </label>
          <select
            value={selectedBusinessId}
            onChange={(e) => setSelectedBusinessId(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c4233] focus:border-transparent"
          >
            <option value="">All Businesses</option>
            {businesses.map((business) => (
              <option key={business.id} value={business.id}>
                {business.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Subscriptions Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-[#1c4233]" />
          <h2 className="text-xl font-semibold text-gray-900">Subscriptions</h2>
          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#1c4233] text-white">
            {filteredSubscriptions.length}
          </span>
        </div>

        {filteredSubscriptions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>No subscriptions found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSubscriptions.map((subscription) => (
              <div
                key={subscription.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {subscription.plan?.name || 'Unknown Plan'}
                      </h3>
                      {getStatusBadge(subscription.status)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        <span>{subscription.business?.name || 'Unknown Business'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {format(new Date(subscription.startedAt), 'MMM dd, yyyy')} -{' '}
                          {format(new Date(subscription.endsAt), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      {subscription.totalAmount && (
                        <div className="flex items-center gap-2">
                          <Receipt className="w-4 h-4" />
                          <span className="font-medium">
                            {currency} {parseDecimal(subscription.totalAmount).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payments Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Receipt className="w-5 h-5 text-[#1c4233]" />
          <h2 className="text-xl font-semibold text-gray-900">Payments</h2>
          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#1c4233] text-white">
            {filteredPayments.length}
          </span>
        </div>

        {filteredPayments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Receipt className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>No payments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Business</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Transaction ID</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">
                        {payment.business?.name || 'Unknown Business'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-gray-900">
                        {currency} {payment.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {format(new Date(payment.createdAt), 'MMM dd, yyyy')}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 font-mono">
                      {payment.transactionId || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
