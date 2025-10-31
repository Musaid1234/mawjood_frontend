'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceService, BusinessWithServices } from '@/services/service.service';
import ServiceCard from '@/components/dashboard/services/ServiceCard';
import AddServiceDialog from '@/components/dashboard/services/AddServiceDialog';
import { Plus, Loader2, Briefcase } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ServicesPage() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: businesses, isLoading, error } = useQuery({
    queryKey: ['my-services'],
    queryFn: () => serviceService.getMyServices(),
  });

  const deleteMutation = useMutation({
    mutationFn: (serviceId: string) => serviceService.deleteService(serviceId),
    onSuccess: () => {
      toast.success('Service deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['my-services'] });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete service');
    },
  });

  const handleAddService = () => {
    setShowAddModal(true);
  };

  const handleDeleteService = async (serviceId: string) => {
    toast('Are you sure you want to delete this service?', {
      description: 'This action cannot be undone.',
      action: {
        label: 'Delete',
        onClick: () => deleteMutation.mutate(serviceId),
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {},
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-[#1c4233]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">Failed to load services</p>
          <p className="text-gray-600 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  const totalServices = businesses?.reduce((acc, b) => acc + b.services.length, 0) || 0;

  if (!businesses || businesses.length === 0) {
    return (
      <>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Briefcase className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Services Yet</h3>
            <p className="text-gray-600 text-center mb-8 max-w-md">
              Start by adding services to your businesses. Services help customers know what you offer.
            </p>
            <button
              onClick={handleAddService}
              className="px-6 py-3 bg-[#1c4233] hover:bg-[#245240] text-white rounded-lg font-semibold transition-colors"
            >
              Add Your First Service
            </button>
          </div>
        </div>
        <AddServiceDialog open={showAddModal} onOpenChange={setShowAddModal} />
      </>
    );
  }

  return (
    <>
      <div className="space-y-6 my-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Services</h1>
            <p className="text-gray-600 mt-1">
              Manage all services across your {businesses.length} {businesses.length === 1 ? 'business' : 'businesses'}
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#1c4233] text-white">
                {totalServices} {totalServices === 1 ? 'Service' : 'Services'}
              </span>
            </p>
          </div>
          <button
            onClick={handleAddService}
            className="flex items-center gap-2 px-6 py-3 bg-[#1c4233] hover:bg-[#245240] text-white rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Add Service
          </button>
        </div>

        {/* Services Grid */}
        <div className="space-y-8">
          {businesses.map((business) => (
            <div key={business.id} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {business.services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    businessName={business.name}
                    businessLogo={business.logo}
                    service={service}
                    onDelete={handleDeleteService}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <AddServiceDialog open={showAddModal} onOpenChange={setShowAddModal} />
    </>
  );
}