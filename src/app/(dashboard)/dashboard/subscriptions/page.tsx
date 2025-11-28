'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionService, SubscriptionPlan, parseDecimal } from '@/services/subscription.service';
import { businessService } from '@/services/business.service';
import { paymentService } from '@/services/payment.service';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { CreditCard, CheckCircle2, Loader2, Building2 } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

const formatBillingFrequency = (intervalCount: number, interval: string) => {
  if (intervalCount === 1) {
    switch (interval) {
      case 'DAY':
        return 'Daily';
      case 'WEEK':
        return 'Weekly';
      case 'MONTH':
        return 'Monthly';
      case 'YEAR':
        return 'Yearly';
      default:
        return `Per ${interval.toLowerCase()}`;
    }
  }

  const intervalLabel = interval.toLowerCase();
  return `Every ${intervalCount} ${intervalLabel}${intervalCount > 1 ? 's' : ''}`;
};

export default function SubscriptionsPage() {
  const { currency } = useCurrency();
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch available plans
  const { data: plansData, isLoading: plansLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => subscriptionService.getSubscriptionPlans({ status: 'ACTIVE', limit: 100 }),
  });

  // Fetch user's businesses
  const { data: businesses, isLoading: businessesLoading } = useQuery({
    queryKey: ['my-businesses'],
    queryFn: () => businessService.getMyBusinesses(),
  });

  // Fetch existing subscriptions
  const { data: subscriptionsData } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => subscriptionService.getSubscriptions({ limit: 100 }),
  });

  const allPlans = plansData?.data?.plans || [];
  // Filter: Fixed plans (no sale price) should not show under weekly billing interval
  const plans = allPlans.filter((plan) => {
    if (plan.billingInterval === 'WEEK' && !plan.salePrice) {
      return false; // Hide fixed price plans for weekly billing
    }
    return true;
  });
  const subscriptions = subscriptionsData?.data?.subscriptions || [];

  const createSubscriptionMutation = useMutation({
    mutationFn: (data: { businessId: string; planId: string }) =>
      subscriptionService.createSubscription(data),
    onSuccess: async (response) => {
      // Create payment record (temporary solution until PayTabs integration)
      try {
        const subscription = response.data;
        const plan = plans.find((p) => p.id === subscription.planId);
        const amount = subscription.totalAmount 
          ? parseDecimal(subscription.totalAmount)
          : (plan ? parseDecimal(plan.price) : 0);

        await paymentService.createPayment({
          businessId: subscription.businessId,
          amount: amount,
          currency: plan?.currency || currency,
          description: `Subscription payment for ${plan?.name || 'plan'}`,
        });

        // Update payment status to completed (temporary - in production, this would come from PayTabs webhook)
        // For now, we'll mark it as completed immediately
        toast.success('Subscription created successfully! Payment processed.');
      } catch (error) {
        console.error('Payment creation error:', error);
        toast.error('Subscription created but payment recording failed');
      }

      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['my-businesses'] });
      setIsDialogOpen(false);
      setSelectedPlan(null);
      setSelectedBusinessId('');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create subscription';
      toast.error(errorMessage);
    },
  });

  const handleSubscribe = (plan: SubscriptionPlan) => {
    if (!businesses || businesses.length === 0) {
      toast.error('You need to create a business first');
      return;
    }

    setSelectedPlan(plan);
    if (businesses.length === 1) {
      setSelectedBusinessId(businesses[0].id);
    }
    setIsDialogOpen(true);
  };

  const handleConfirmSubscribe = () => {
    if (!selectedPlan || !selectedBusinessId) {
      toast.error('Please select a business');
      return;
    }

    // Check if business is approved
    const selectedBusiness = businesses?.find(b => b.id === selectedBusinessId);
    if (selectedBusiness?.status !== 'APPROVED') {
      toast.error('Business must be approved before purchasing a subscription. Please wait for admin approval.');
      return;
    }

    // Check if business already has an active subscription
    const activeSubscription = subscriptions.find(
      (sub) =>
        sub.businessId === selectedBusinessId &&
        sub.status === 'ACTIVE' &&
        new Date(sub.endsAt) > new Date()
    );

    if (activeSubscription) {
      toast.error('This business already has an active subscription');
      return;
    }

    createSubscriptionMutation.mutate({
      businessId: selectedBusinessId,
      planId: selectedPlan.id,
    });
  };

  const getBusinessSubscription = (businessId: string) => {
    return subscriptions.find(
      (sub) =>
        sub.businessId === businessId &&
        sub.status === 'ACTIVE' &&
        new Date(sub.endsAt) > new Date()
    );
  };

  if (plansLoading || businessesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#1c4233]" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 my-2 sm:my-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Subscription Plans</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Choose a subscription plan to boost your business visibility
        </p>
      </div>

      {businesses && businesses.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            You need to create a business first before subscribing to a plan.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-[#1c4233] transition-colors relative flex flex-col h-full"
          >
            {plan.topPlacement && (
              <div className="absolute top-4 right-4 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded">
                POPULAR
              </div>
            )}

            <div className="mb-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-[#1c4233]">
                  {plan.currency} {plan.salePrice ? parseDecimal(plan.salePrice).toFixed(2) : parseDecimal(plan.price).toFixed(2)}
                </span>
                {plan.salePrice && (
                  <span className="text-xl text-gray-500 line-through">
                    {plan.currency} {parseDecimal(plan.price).toFixed(2)}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {formatBillingFrequency(plan.intervalCount, plan.billingInterval)}
              </p>
            </div>

            {plan.description && (
              <p className="text-gray-600 mb-4">{plan.description}</p>
            )}

            <div className="space-y-2 mb-6">
              {plan.verifiedBadge && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Verified Badge</span>
                </div>
              )}
              {plan.topPlacement && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Top Placement in Listings</span>
                </div>
              )}
              {plan.allowAdvertisements && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>
                    Create Advertisements
                    {plan.maxAdvertisements && ` (${plan.maxAdvertisements} max)`}
                  </span>
                </div>
              )}
            </div>

            <Button
              onClick={() => handleSubscribe(plan)}
              className="w-full bg-[#1c4233] hover:bg-[#245240] mt-auto"
              disabled={!businesses || businesses.length === 0}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Subscribe Now
            </Button>
          </div>
        ))}
      </div>

      {plans.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No subscription plans available at the moment.</p>
        </div>
      )}

      {/* Current Subscriptions */}
      {businesses && businesses.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Current Subscriptions</h2>
          <div className="space-y-4">
            {businesses.map((business) => {
              const subscription = getBusinessSubscription(business.id);
              if (!subscription) return null;

              const plan = plans.find((p) => p.id === subscription.planId);

              return (
                <div
                  key={business.id}
                  className="bg-white rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-[#1c4233]" />
                      <div>
                        <h3 className="font-semibold text-gray-900">{business.name}</h3>
                        <p className="text-sm text-gray-600">
                          {plan?.name || 'Unknown Plan'} • Active until{' '}
                          {new Date(subscription.endsAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium w-fit">
                      Active
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subscribe to {selectedPlan?.name}</DialogTitle>
            <DialogDescription>
              Select a business to subscribe to this plan
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedPlan && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Plan Price:</span>
                  <span className="text-xl font-bold text-[#1c4233]">
                    {selectedPlan.currency}{' '}
                    {selectedPlan.salePrice
                      ? parseDecimal(selectedPlan.salePrice).toFixed(2)
                      : parseDecimal(selectedPlan.price).toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Billing: {selectedPlan.intervalCount} {selectedPlan.billingInterval.toLowerCase()}
                  {selectedPlan.intervalCount > 1 ? 's' : ''}
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Business
              </label>
              <select
                value={selectedBusinessId}
                onChange={(e) => setSelectedBusinessId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c4233] focus:border-transparent"
              >
                <option value="">Select a business</option>
                {businesses?.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.name} {business.status !== 'APPROVED' ? '(Pending Approval)' : ''}
                  </option>
                ))}
              </select>
              {selectedBusinessId && businesses?.find(b => b.id === selectedBusinessId)?.status !== 'APPROVED' && (
                <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">
                    <strong>Note:</strong> This business is pending approval. You can only purchase subscriptions for approved businesses.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Payment integration (PayTabs) is pending. For now, the
                subscription will be activated immediately after confirmation.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setSelectedPlan(null);
                setSelectedBusinessId('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmSubscribe}
              className="bg-[#1c4233] hover:bg-[#245240]"
              disabled={!selectedBusinessId || createSubscriptionMutation.isPending}
            >
              {createSubscriptionMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Confirm Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

