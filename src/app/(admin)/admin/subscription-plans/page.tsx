'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionService, SubscriptionPlan, parseDecimal } from '@/services/subscription.service';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Plus, Edit, Archive, Loader2 } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';
import PlanFormDialog, { PlanFormValues } from '@/components/admin/subscription-plans/PlanFormDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function SubscriptionPlansPage() {
  const { currency } = useCurrency();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [planToArchive, setPlanToArchive] = useState<SubscriptionPlan | null>(null);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [formData, setFormData] = useState<PlanFormValues>({
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
      setIsArchiveDialogOpen(false);
      setPlanToArchive(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to archive subscription plan');
    },
  });

  // Auto-generate slug from name
  useEffect(() => {
    if (!editingPlan && formData.name) {
      const generatedSlug = formData.name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
      setFormData((prev) => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.name, editingPlan]);

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

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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

  const handleArchiveClick = (plan: SubscriptionPlan) => {
    setPlanToArchive(plan);
    setIsArchiveDialogOpen(true);
  };

  const confirmArchive = () => {
    if (!planToArchive) return;
    archiveMutation.mutate(planToArchive.id);
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
                  onClick={() => handleArchiveClick(plan)}
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

      <PlanFormDialog
        open={isDialogOpen}
        onOpenChange={handleDialogOpenChange}
        formData={formData}
        setFormData={setFormData}
        editingPlan={editingPlan}
        onSubmit={handleSubmit}
        onCancel={() => {
          setIsDialogOpen(false);
          resetForm();
        }}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      <AlertDialog
        open={isArchiveDialogOpen}
        onOpenChange={(open) => {
          setIsArchiveDialogOpen(open);
          if (!open) {
            setPlanToArchive(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive subscription plan?</AlertDialogTitle>
            <AlertDialogDescription>
              This will hide {planToArchive?.name ?? 'this plan'} from businesses until you reactivate it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={archiveMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmArchive}
              disabled={archiveMutation.isPending}
              className="bg-[#1c4233] hover:bg-[#245240]"
            >
              {archiveMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

