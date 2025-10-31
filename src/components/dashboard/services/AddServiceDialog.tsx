'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { businessService } from '@/services/business.service';
import { serviceService } from '@/services/service.service';
import { toast } from 'sonner';
import { Loader2, Building2, CircleDollarSign, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AddServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddServiceDialog({ open, onOpenChange }: AddServiceDialogProps) {
  const queryClient = useQueryClient();
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
  });

  // Fetch user's businesses
  const { data: businesses, isLoading: loadingBusinesses } = useQuery({
    queryKey: ['my-businesses'],
    queryFn: () => businessService.getMyBusinesses(),
    enabled: open,
  });

  // Create service mutation
  const createMutation = useMutation({
    mutationFn: (data: { businessId: string; serviceData: any }) =>
      serviceService.createService(data.businessId, data.serviceData),
    onSuccess: () => {
      toast.success('Service created successfully!');
      queryClient.invalidateQueries({ queryKey: ['my-services'] });
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create service');
    },
  });

  const handleClose = () => {
    setSelectedBusinessId('');
    setFormData({
      name: '',
      description: '',
      price: '',
      duration: '',
    });
    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBusinessId) {
      toast.error('Please select a business');
      return;
    }

    if (!formData.name || !formData.price) {
      toast.error('Service name and price are required');
      return;
    }

    createMutation.mutate({
      businessId: selectedBusinessId,
      serviceData: {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        duration: formData.duration ? parseInt(formData.duration) : undefined,
      },
    });
  };

  const isFormDisabled = !selectedBusinessId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Add New Service
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Add a new service to one of your businesses
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Business Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Business <span className="text-red-500">*</span>
            </label>
            {loadingBusinesses ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#1c4233]" />
              </div>
            ) : (
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={selectedBusinessId}
                  onChange={(e) => setSelectedBusinessId(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c4233] focus:border-transparent appearance-none bg-white"
                  required
                >
                  <option value="">Choose a business...</option>
                  {businesses?.map((business) => (
                    <option key={business.id} value={business.id}>
                      {business.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Service Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Haircut, Oil Change, Website Design"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c4233] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={isFormDisabled}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your service..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c4233] focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={isFormDisabled}
            />
          </div>

          {/* Price and Duration */}
          <div className="grid grid-cols-2 gap-4">
            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (SAR) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <CircleDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c4233] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={isFormDisabled}
                  required
                />
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (min)
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="30"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c4233] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={isFormDisabled}
                />
              </div>
            </div>
          </div>

          {/* Helper Text */}
          {!selectedBusinessId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                💡 Please select a business first to enable the form
              </p>
            </div>
          )}

          {/* Footer Buttons */}
          <DialogFooter className="gap-2 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              disabled={createMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || isFormDisabled}
              className="px-6 py-2 bg-[#1c4233] hover:bg-[#245240] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Service'    
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}