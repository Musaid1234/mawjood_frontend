'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { businessService } from '@/services/business.service';
import { serviceService } from '@/services/service.service';
import { toast } from 'sonner';
import { Loader2, Building2, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useCurrency } from '@/hooks/useCurrency';
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
  editingService?: any;
  businessId?: string;
}

export default function AddServiceDialog({ open, onOpenChange, editingService, businessId }: AddServiceDialogProps) {
  const queryClient = useQueryClient();
  const { currency } = useCurrency();
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>(businessId || '');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    youtubeUrl: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Load editing service data when dialog opens
  useEffect(() => {
    if (editingService && open) {
      setFormData({
        name: editingService.name || '',
        description: editingService.description || '',
        price: editingService.price?.toString() || '',
        youtubeUrl: editingService.youtubeUrl || '',
      });
      setImagePreview(editingService.image || null);
      setImageFile(null); // Reset file when editing
      setSelectedBusinessId(businessId || '');
    } else if (!editingService && open) {
      // Reset form for new service
      setFormData({
        name: '',
        description: '',
        price: '',
        youtubeUrl: '',
      });
      setImageFile(null);
      setImagePreview(null);
      setSelectedBusinessId(businessId || '');
    }
  }, [editingService, open, businessId]);

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

  // Update service mutation
  const updateMutation = useMutation({
    mutationFn: (data: { serviceId: string; serviceData: any }) =>
      serviceService.updateService(data.serviceId, data.serviceData),
    onSuccess: () => {
      toast.success('Service updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['my-services'] });
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update service');
    },
  });

  const handleClose = () => {
    setSelectedBusinessId('');
    setFormData({
      name: '',
      description: '',
      price: '',
      youtubeUrl: '',
    });
    setImageFile(null);
    setImagePreview(null);
    onOpenChange(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
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

    if (editingService) {
      updateMutation.mutate({
        serviceId: editingService.id,
        serviceData: {
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          youtubeUrl: formData.youtubeUrl || undefined,
          image: imageFile || undefined,
        },
      });
    } else {
      createMutation.mutate({
        businessId: selectedBusinessId,
        serviceData: {
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          youtubeUrl: formData.youtubeUrl || undefined,
          image: imageFile || undefined,
        },
      });
    }
  };

  const isFormDisabled = !editingService && !selectedBusinessId;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {editingService ? 'Edit Service' : 'Add New Service'}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {editingService ? 'Update service details' : 'Add a new service to one of your businesses'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className={`grid grid-cols-1 ${!editingService ? 'md:grid-cols-2' : ''} gap-4`}>
            {/* Business Selection */}
            {!editingService && (
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
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c4233] focus:border-transparent appearance-none bg-white text-sm"
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
            )}

            {/* Service Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Haircut, Oil Change"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c4233] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                disabled={isFormDisabled}
                required
              />
            </div>
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
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c4233] focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
              disabled={isFormDisabled}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price ({currency}) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c4233] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                disabled={isFormDisabled}
                required
              />
            </div>

            {/* YouTube URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                YouTube Video URL
              </label>
              <input
                type="url"
                value={formData.youtubeUrl}
                onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c4233] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                disabled={isFormDisabled}
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Image
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="service-image-upload"
                disabled={isFormDisabled}
              />
              <label
                htmlFor="service-image-upload"
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  isFormDisabled
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                    : 'border-gray-300 bg-gray-50 hover:border-[#1c4233]'
                }`}
              >
                {imagePreview ? (
                  <div className="relative w-full h-full group">
                    <Image src={imagePreview} alt="Service preview" fill className="object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        removeImage();
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-gray-400 mb-1" />
                    <p className="text-xs text-gray-500">Click to upload image</p>
                  </>
                )}
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500">Maximum file size: 2 MB</p>
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
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isFormDisabled}
              className="px-6 py-2 bg-[#1c4233] hover:bg-[#245240] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {editingService ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                editingService ? 'Update Service' : 'Create Service'
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}