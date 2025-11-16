'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionService, SubscriptionPlan, parseDecimal } from '@/services/subscription.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Edit, Archive, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

export default function SubscriptionPlansPage() {
  const { currency } = useCurrency();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    salePrice: '',
    currency: currency,
    status: 'ACTIVE' as 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED',
    billingInterval: 'MONTH' as 'DAY' | 'WEEK' | 'MONTH' | 'YEAR' | 'CUSTOM',
    intervalCount: '1',
    customIntervalDays: '',
    verifiedBadge: false,
    topPlacement: false,
    allowAdvertisements: false,
    maxAdvertisements: '',
    couponCode: '',
    couponType: 'NONE' as 'NONE' | 'PERCENTAGE' | 'AMOUNT',
    couponValue: '',
    couponMaxDiscount: '',
    couponStartsAt: '',
    couponEndsAt: '',
    couponUsageLimit: '',
    notes: '',
  });

  const { data: plansData, isLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => subscriptionService.getSubscriptionPlans({ limit: 100 }),
  });

  const plans = plansData?.data?.plans || [];

  const createMutation = useMutation({
    mutationFn: (data: any) => subscriptionService.createSubscriptionPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      toast.success('Subscription plan created successfully');
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create subscription plan');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      subscriptionService.updateSubscriptionPlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      toast.success('Subscription plan updated successfully');
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update subscription plan');
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => subscriptionService.archiveSubscriptionPlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      toast.success('Subscription plan archived successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to archive subscription plan');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      price: '',
      salePrice: '',
      currency: currency,
      status: 'ACTIVE',
      billingInterval: 'MONTH',
      intervalCount: '1',
      customIntervalDays: '',
      verifiedBadge: false,
      topPlacement: false,
      allowAdvertisements: false,
      maxAdvertisements: '',
      couponCode: '',
      couponType: 'NONE',
      couponValue: '',
      couponMaxDiscount: '',
      couponStartsAt: '',
      couponEndsAt: '',
      couponUsageLimit: '',
      notes: '',
    });
    setEditingPlan(null);
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      slug: plan.slug,
      description: plan.description || '',
      price: parseDecimal(plan.price).toString(),
      salePrice: plan.salePrice ? parseDecimal(plan.salePrice).toString() : '',
      currency: plan.currency,
      status: plan.status,
      billingInterval: plan.billingInterval,
      intervalCount: plan.intervalCount.toString(),
      customIntervalDays: plan.customIntervalDays?.toString() || '',
      verifiedBadge: plan.verifiedBadge,
      topPlacement: plan.topPlacement,
      allowAdvertisements: plan.allowAdvertisements,
      maxAdvertisements: plan.maxAdvertisements?.toString() || '',
      couponCode: plan.couponCode || '',
      couponType: plan.couponType,
      couponValue: plan.couponValue?.toString() || '',
      couponMaxDiscount: plan.couponMaxDiscount?.toString() || '',
      couponStartsAt: plan.couponStartsAt || '',
      couponEndsAt: plan.couponEndsAt || '',
      couponUsageLimit: plan.couponUsageLimit?.toString() || '',
      notes: plan.notes || '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: any = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description || undefined,
      price: parseFloat(formData.price),
      salePrice: formData.salePrice ? parseFloat(formData.salePrice) : undefined,
      currency: formData.currency,
      status: formData.status,
      billingInterval: formData.billingInterval,
      intervalCount: parseInt(formData.intervalCount),
      customIntervalDays: formData.customIntervalDays ? parseInt(formData.customIntervalDays) : undefined,
      verifiedBadge: formData.verifiedBadge,
      topPlacement: formData.topPlacement,
      allowAdvertisements: formData.allowAdvertisements,
      maxAdvertisements: formData.maxAdvertisements ? parseInt(formData.maxAdvertisements) : undefined,
      couponCode: formData.couponCode || undefined,
      couponType: formData.couponType,
      couponValue: formData.couponValue ? parseFloat(formData.couponValue) : undefined,
      couponMaxDiscount: formData.couponMaxDiscount ? parseFloat(formData.couponMaxDiscount) : undefined,
      couponStartsAt: formData.couponStartsAt || undefined,
      couponEndsAt: formData.couponEndsAt || undefined,
      couponUsageLimit: formData.couponUsageLimit ? parseInt(formData.couponUsageLimit) : undefined,
      notes: formData.notes || undefined,
    };

    if (editingPlan) {
      updateMutation.mutate({ id: editingPlan.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleArchive = (id: string) => {
    if (confirm('Are you sure you want to archive this subscription plan?')) {
      archiveMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#1c4233]" />
      </div>
    );
  }

  return (
    <div className="py-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subscription Plans</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage subscription plans for businesses
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
          className="bg-[#1c4233] hover:bg-[#245240]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {plan.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {plan.slug}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(plan)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleArchive(plan.id)}
                >
                  <Archive className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Price:</span>
                <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
                  {plan.currency} {plan.salePrice ? parseDecimal(plan.salePrice).toFixed(2) : parseDecimal(plan.price).toFixed(2)}
                  {plan.salePrice && (
                    <span className="text-sm text-gray-500 line-through ml-2">
                      {plan.currency} {parseDecimal(plan.price).toFixed(2)}
                    </span>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Billing:</span>
                <span className="text-gray-900 dark:text-gray-100">
                  {plan.intervalCount} {plan.billingInterval.toLowerCase()}
                  {plan.intervalCount > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    plan.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-800'
                      : plan.status === 'DRAFT'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {plan.status}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {plan.verifiedBadge && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  Verified Badge
                </span>
              )}
              {plan.topPlacement && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                  Top Placement
                </span>
              )}
              {plan.allowAdvertisements && (
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                  Advertisements
                </span>
              )}
            </div>

            {plan.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {plan.description}
              </p>
            )}
          </div>
        ))}
      </div>

      {plans.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No subscription plans found. Create your first plan to get started.
          </p>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
            </DialogTitle>
            <DialogDescription>
              {editingPlan
                ? 'Update the subscription plan details'
                : 'Create a new subscription plan for businesses'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                  Slug *
                </label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c4233] focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Price *
                </label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="salePrice" className="block text-sm font-medium text-gray-700 mb-1">
                  Sale Price
                </label>
                <Input
                  id="salePrice"
                  type="number"
                  step="0.01"
                  value={formData.salePrice}
                  onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <Input
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="billingInterval" className="block text-sm font-medium text-gray-700 mb-1">
                  Billing Interval
                </label>
                <Select
                  value={formData.billingInterval}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, billingInterval: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAY">Day</SelectItem>
                    <SelectItem value="WEEK">Week</SelectItem>
                    <SelectItem value="MONTH">Month</SelectItem>
                    <SelectItem value="YEAR">Year</SelectItem>
                    <SelectItem value="CUSTOM">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="intervalCount" className="block text-sm font-medium text-gray-700 mb-1">
                  Interval Count
                </label>
                <Input
                  id="intervalCount"
                  type="number"
                  value={formData.intervalCount}
                  onChange={(e) => setFormData({ ...formData, intervalCount: e.target.value })}
                />
              </div>
              {formData.billingInterval === 'CUSTOM' && (
                <div>
                  <label htmlFor="customIntervalDays" className="block text-sm font-medium text-gray-700 mb-1">
                    Custom Days
                  </label>
                  <Input
                    id="customIntervalDays"
                    type="number"
                    value={formData.customIntervalDays}
                    onChange={(e) =>
                      setFormData({ ...formData, customIntervalDays: e.target.value })
                    }
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Features</label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.verifiedBadge}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, verifiedBadge: e.target.checked })
                    }
                  />
                  <span>Verified Badge</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.topPlacement}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, topPlacement: e.target.checked })
                    }
                  />
                  <span>Top Placement</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.allowAdvertisements}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, allowAdvertisements: e.target.checked })
                    }
                  />
                  <span>Allow Advertisements</span>
                </label>
              </div>
            </div>

            {formData.allowAdvertisements && (
              <div>
                <label htmlFor="maxAdvertisements" className="block text-sm font-medium text-gray-700 mb-1">
                  Max Advertisements
                </label>
                <Input
                  id="maxAdvertisements"
                  type="number"
                  value={formData.maxAdvertisements}
                  onChange={(e) =>
                    setFormData({ ...formData, maxAdvertisements: e.target.value })
                  }
                />
              </div>
            )}

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c4233] focus:border-transparent"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#1c4233] hover:bg-[#245240]"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {editingPlan ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

