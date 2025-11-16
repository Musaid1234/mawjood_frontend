'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceService } from '@/services/service.service';
import ServiceCard from '@/components/dashboard/services/ServiceCard';
import AddServiceDialog from '@/components/dashboard/services/AddServiceDialog';
import { Plus, Loader2, Briefcase, Search, X, Filter } from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import Image from 'next/image';

export default function ServicesPage() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');

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

  const totalServices = useMemo(
    () => businesses?.reduce((acc, b) => acc + b.services.length, 0) || 0,
    [businesses]
  );

  // Filter businesses and services based on search and filter
  const filteredBusinesses = useMemo(() => {
    if (!businesses) return [];

    return businesses
      .filter((business) => {
        // Filter by business name if selected
        if (selectedBusinessId && business.id !== selectedBusinessId) {
          return false;
        }
        return true;
      })
      .map((business) => {
        // Filter services by search term
        const filteredServices = business.services.filter((service) => {
          if (!searchTerm.trim()) return true;
          const searchLower = searchTerm.toLowerCase();
          return service.name.toLowerCase().includes(searchLower);
        });
        return { ...business, services: filteredServices };
      })
      .filter((business) => business.services.length > 0); // Only show businesses with matching services
  }, [businesses, searchTerm, selectedBusinessId]);

  const filteredTotalServices = useMemo(
    () => filteredBusinesses.reduce((acc, b) => acc + b.services.length, 0),
    [filteredBusinesses]
  );

  const handleAddService = useCallback(() => {
    setEditingService(null);
    setShowAddModal(true);
  }, []);

  const handleEditService = useCallback((service: any) => {
    const business = businesses?.find(b => b.services.some(s => s.id === service.id));
    setEditingService({ ...service, businessId: business?.id });
    setShowAddModal(true);
  }, [businesses]);

  const handleCloseDialog = useCallback(() => {
    setShowAddModal(false);
    setEditingService(null);
  }, []);

  const handleDeleteService = useCallback((serviceId: string) => {
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
  }, [deleteMutation]);

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
        <AddServiceDialog 
          open={showAddModal} 
          onOpenChange={handleCloseDialog}
          editingService={editingService}
          businessId={editingService?.businessId}
        />
      </>
    );
  }

  return (
    <>
      <div className="space-y-6 my-5">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Services</h1>
            <p className="text-gray-600 mt-1">
              Manage all services across your {businesses.length} {businesses.length === 1 ? 'business' : 'businesses'}
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#1c4233] text-white">
                {searchTerm || selectedBusinessId ? filteredTotalServices : totalServices} {searchTerm || selectedBusinessId ? (filteredTotalServices === 1 ? 'Service' : 'Services') : (totalServices === 1 ? 'Service' : 'Services')}
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

        {/* Search and Filter */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          {/* Search by Service Name */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by service name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c4233] focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Filter by Business */}
          <div className="relative md:w-64">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10 pointer-events-none" />
            <select
              value={selectedBusinessId}
              onChange={(e) => setSelectedBusinessId(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c4233] focus:border-transparent appearance-none bg-white cursor-pointer"
            >
              <option value="">All Businesses</option>
              {businesses.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.name}
                </option>
              ))}
            </select>
            {selectedBusinessId && (
              <button
                onClick={() => setSelectedBusinessId('')}
                className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Services by Business */}
        {filteredBusinesses.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No services found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedBusinessId
                ? 'Try adjusting your search or filter criteria.'
                : 'No services match your criteria.'}
            </p>
            {(searchTerm || selectedBusinessId) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedBusinessId('');
                }}
                className="text-[#1c4233] hover:text-[#245240] font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {filteredBusinesses.map((business) => (
            <div key={business.id} className="bg-white rounded-lg border border-gray-200 p-6">
              {/* Business Header */}
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0">
                  {business.logo ? (
                    <Image 
                      src={business.logo} 
                      alt={business.name} 
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <Briefcase className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">{business.name}</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {business.services.length} {business.services.length === 1 ? 'service' : 'services'}
                  </p>
                </div>
              </div>

              {/* Services Grid */}
              {business.services.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {business.services.map((service) => (
                    <ServiceCard
                      key={service.id}
                      businessName={business.name}
                      businessLogo={business.logo || ''}
                      service={service}
                      onDelete={handleDeleteService}
                      onEdit={handleEditService}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No services added yet for this business</p>
                </div>
              )}
            </div>
            ))}
          </div>
        )}
      </div>
      <AddServiceDialog 
        open={showAddModal} 
        onOpenChange={handleCloseDialog}
        editingService={editingService}
        businessId={editingService?.businessId}
      />
    </>
  );
}