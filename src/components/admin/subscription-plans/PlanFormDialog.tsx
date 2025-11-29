'use client';

import { Dispatch, FormEvent, SetStateAction } from 'react';
import { Loader2 } from 'lucide-react';
import { SubscriptionPlan } from '@/services/subscription.service';
import {
    Dialog,
    DialogContent,
    DialogTitle,
  } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface PlanFormValues {
  name: string;
  slug: string;
  description: string;
  price: string;
  salePrice: string;
  currency: string;
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  billingInterval: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR' | 'CUSTOM';
  intervalCount: string;
  customIntervalDays: string;
  verifiedBadge: boolean;
  topPlacement: boolean;
  allowAdvertisements: boolean;
  maxAdvertisements: string;
  couponCode: string;
  couponType: 'NONE' | 'PERCENTAGE' | 'AMOUNT';
  couponValue: string;
  couponMaxDiscount: string;
  couponStartsAt: string;
  couponEndsAt: string;
  couponUsageLimit: string;
  notes: string;
}

interface PlanFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: PlanFormValues;
  setFormData: Dispatch<SetStateAction<PlanFormValues>>;
  editingPlan: SubscriptionPlan | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const PlanFormDialog = ({
  open,
  onOpenChange,
  formData,
  setFormData,
  editingPlan,
  onSubmit,
  onCancel,
  isSubmitting,
}: PlanFormDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto p-0">
        <div className="p-6 sm:p-8">
          <header className="flex justify-between items-start mb-6">
            <div>
            <DialogTitle className="sr-only">
    {editingPlan ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
  </DialogTitle>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {editingPlan
                  ? 'Update the subscription plan details'
                  : 'Create a new subscription plan for businesses'}
              </p>
            </div>
          </header>
          <form onSubmit={onSubmit}>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Name *
                  </label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    required
                    className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-[#1c4233] focus:ring-[#1c4233] bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="slug"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Slug *
                  </label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                    required
                    className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-[#1c4233] focus:ring-[#1c4233] bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 shadow-sm focus:border-[#1c4233] focus:ring-[#1c4233] bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Price *
                  </label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                    required
                    className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-[#1c4233] focus:ring-[#1c4233] bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="salePrice"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Sale Price
                  </label>
                  <Input
                    id="salePrice"
                    type="number"
                    step="0.01"
                    value={formData.salePrice}
                    onChange={(e) => setFormData((prev) => ({ ...prev, salePrice: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-[#1c4233] focus:ring-[#1c4233] bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="currency"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Currency
                  </label>
                  <Input
                    id="currency"
                    value={formData.currency}
                    onChange={(e) => setFormData((prev) => ({ ...prev, currency: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-[#1c4233] focus:ring-[#1c4233] bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-200 sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div className="md:col-span-1">
                  <label
                    htmlFor="billingInterval"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Billing Interval
                  </label>
                  <Select
                    value={formData.billingInterval}
                    onValueChange={(value: PlanFormValues['billingInterval']) =>
                      setFormData((prev) => ({ ...prev, billingInterval: value }))
                    }
                  >
                    <SelectTrigger className="mt-1 w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-[#1c4233] focus:ring-[#1c4233] bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 sm:text-sm">
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
                <div className="md:col-span-1">
                  <label
                    htmlFor="intervalCount"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Interval Count
                  </label>
                  <Input
                    id="intervalCount"
                    type="number"
                    value={formData.intervalCount}
                    onChange={(e) => setFormData((prev) => ({ ...prev, intervalCount: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-[#1c4233] focus:ring-[#1c4233] bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 sm:text-sm"
                  />
                </div>
                <div className="md:col-span-1">
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Status
                  </label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: PlanFormValues['status']) =>
                      setFormData((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger className="mt-1 w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-[#1c4233] focus:ring-[#1c4233] bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 sm:text-sm">
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

              {formData.billingInterval === 'CUSTOM' && (
                <div>
                  <label
                    htmlFor="customIntervalDays"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Custom Days
                  </label>
                  <Input
                    id="customIntervalDays"
                    type="number"
                    value={formData.customIntervalDays}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, customIntervalDays: e.target.value }))
                    }
                    className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-[#1c4233] focus:ring-[#1c4233] bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 sm:text-sm"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Notes
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 shadow-sm focus:border-[#1c4233] focus:ring-[#1c4233] bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 sm:text-sm"
                />
              </div>
            </div>

            <footer className="mt-8 flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-[#1c4233]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-[#1c4233] rounded-md shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-[#1c4233]"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingPlan ? 'Update' : 'Create'}
              </Button>
            </footer>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlanFormDialog;


