'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { adminService } from '@/services/admin.service';
import { BusinessesTable } from '@/components/admin/businesses/BusinessesTable';
import { createColumns, Business } from '@/components/admin/businesses/columns';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Download, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { categoryService, Category } from '@/services/category.service';
import { cityService, Country, Region, City } from '@/services/city.service';

type TabType = 'all' | 'pending' | 'suspended' | 'approved' | 'rejected';

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchInput, setSearchInput] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    suspended: 0,
    rejected: 0,
  });
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: 'approve' | 'reject' | 'suspend' | null;
    businessId: string | null;
  }>({ open: false, type: null, businessId: null });

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');

  // Filter options
  const [categories, setCategories] = useState<Category[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingFilters, setLoadingFilters] = useState(true);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchBusinesses();
  }, [activeTab, searchInput, selectedCategory, selectedCountry, selectedRegion, selectedCity]);

  const fetchFilterOptions = async () => {
    try {
      setLoadingFilters(true);
      const [categoriesData, countriesData, regionsData, citiesData] = await Promise.all([
        categoryService.fetchCategories(1, 1000).then((res) => res.data.categories),
        cityService.fetchCountries(),
        cityService.fetchRegions(),
        cityService.fetchCities(),
      ]);

      // Flatten categories (include subcategories)
      const allCategories: Category[] = [];
      categoriesData.forEach((cat) => {
        allCategories.push(cat);
        if (cat.subcategories) {
          allCategories.push(...cat.subcategories);
        }
      });

      setCategories(allCategories);
      setCountries(countriesData);
      setRegions(regionsData);
      setAllRegions(regionsData); // Store all regions for filtering
      setCities(citiesData);
      setAllCities(citiesData); // Store all cities for filtering

      if (selectedCountry === 'all') {
        const saudiArabia = countriesData.find(
          (c) => c.name.toLowerCase().includes('saudi') || 
                 c.name.toLowerCase().includes('السعودية') ||
                 c.slug.toLowerCase().includes('saudi') ||
                 c.name.toLowerCase() === 'saudi arabia'
        );
        if (saudiArabia) {
          setSelectedCountry(saudiArabia.id);
        }
      }
    } catch (error: any) {
      console.error('Error fetching filter options:', error);
      toast.error('Failed to load filter options');
    } finally {
      setLoadingFilters(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchFilterOptions();
  }, []);

  // Store all regions separately (don't overwrite when country changes)
  const [allRegions, setAllRegions] = useState<Region[]>([]);
  const [allCities, setAllCities] = useState<City[]>([]);

  // Update regions and cities when country changes (for dropdown options only)
  useEffect(() => {
    if (selectedCountry === 'all') {
      setSelectedRegion('all');
      setSelectedCity('all');
      // Show all regions and cities when no country selected
      setRegions(allRegions);
      setCities(allCities);
    } else {
      const country = countries.find((c) => c.id === selectedCountry);
      if (country?.regions) {
        const countryRegions = country.regions;
        setRegions(countryRegions); // Only update dropdown options
        // Get all cities from country's regions
        const countryCities = countryRegions.flatMap((r) => r.cities || []);
        setCities(countryCities); // Only update dropdown options
      } else if (allRegions.length > 0) {
        // If country doesn't have regions in the response, filter from allRegions
        const countryRegions = allRegions.filter((r) => r.countryId === selectedCountry);
        setRegions(countryRegions);
        // Get cities for these regions
        const countryCities = allCities.filter((c) => {
          const cityRegion = allRegions.find((r) => r.id === c.regionId);
          return cityRegion?.countryId === selectedCountry;
        });
        setCities(countryCities);
      }
      setSelectedRegion('all');
      setSelectedCity('all');
    }
  }, [selectedCountry, countries, allRegions, allCities]);

  // Update cities when region changes
  useEffect(() => {
    if (selectedRegion === 'all') {
      // If no region selected, show all cities (or cities from selected country)
      if (selectedCountry !== 'all') {
        const country = countries.find((c) => c.id === selectedCountry);
        if (country?.regions) {
          const countryCities = country.regions.flatMap((r) => r.cities || []);
          setCities(countryCities);
        }
      } else {
        // Show all cities
        cityService.fetchCities().then(setCities).catch(console.error);
      }
      setSelectedCity('all');
    } else {
      const region = regions.find((r) => r.id === selectedRegion);
      if (region?.cities) {
        setCities(region.cities);
      } else {
        // If region doesn't have cities, fetch them
        cityService.fetchCities().then((allCities) => {
          const regionCities = allCities.filter((c) => c.regionId === selectedRegion);
          setCities(regionCities);
        }).catch(console.error);
      }
      setSelectedCity('all');
    }
  }, [selectedRegion, regions, selectedCountry, countries]);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await adminService.getDashboardStats();
      const businessStatus = response.data.businessStatus;
      setStats({
        total: response.data.overview.totalBusinesses,
        pending: businessStatus.pending,
        approved: businessStatus.approved,
        suspended: businessStatus.suspended,
        rejected: businessStatus.rejected,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Sync active tab with URL (e.g. ?tab=pending)
  useEffect(() => {
    const tabParam = (searchParams.get('tab') as TabType | null) || 'all';
    const validTabs: TabType[] = ['all', 'pending', 'suspended', 'approved', 'rejected'];
    const nextTab = validTabs.includes(tabParam) ? tabParam : 'all';
    if (nextTab !== activeTab) {
      setActiveTab(nextTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);

    const params = new URLSearchParams(searchParams.toString());
    if (tab === 'all') {
      params.delete('tab');
    } else {
      params.set('tab', tab);
    }

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  };

  const fetchBusinesses = async () => {
    try {
      setSearchLoading(true);
      const params: any = {
        page: 1,
        limit: 1000, // Fetch more to allow client-side filtering
      };

      if (searchInput) {
        params.search = searchInput;
      }

      let response;
      if (activeTab === 'pending') {
        response = await adminService.getPendingBusinesses(params);
      } else {
        const statusMap: Record<string, string> = {
          all: '',
          suspended: 'SUSPENDED',
          approved: 'APPROVED',
          rejected: 'REJECTED',
        };
        params.status = statusMap[activeTab];
        response = await adminService.getAllBusinesses(params);
      }

      let filteredBusinesses = response.data.businesses || [];

      // Client-side filtering
      if (selectedCategory !== 'all') {
        filteredBusinesses = filteredBusinesses.filter(
          (b: Business) => b.category?.id === selectedCategory
        );
      }

      // Apply location filters (city, region, country)
      if (selectedCity !== 'all') {
        filteredBusinesses = filteredBusinesses.filter(
          (b: Business) => b.city?.id === selectedCity
        );
      } else if (selectedRegion !== 'all') {
        // Filter by region/state - use allRegions for filtering (not just filtered dropdown options)
        const selectedRegionData = allRegions.find((r) => r.id === selectedRegion);
        if (selectedRegionData) {
          filteredBusinesses = filteredBusinesses.filter((b: Business) => {
            if (!b.city) return false;
            
            // Get the region from the business city
            const businessRegion = (b.city as any)?.region;
            if (!businessRegion) {
              // If no region in business data, try to find city's region from our cities list
              const cityData = allCities.find((c) => c.id === b.city?.id);
              if (cityData?.regionId) {
                return cityData.regionId === selectedRegion;
              }
              return false;
            }
            
            // Try to match by id first (most reliable)
            if (businessRegion.id) {
              return businessRegion.id === selectedRegion;
            }
            
            // Fallback: match by region name (case-insensitive)
            if (businessRegion.name) {
              return businessRegion.name.toLowerCase() === selectedRegionData.name.toLowerCase();
            }
            
            // Last resort: check if city's regionId matches
            const cityData = allCities.find((c) => c.id === b.city?.id);
            if (cityData?.regionId) {
              return cityData.regionId === selectedRegion;
            }
            
            return false;
          });
        }
      } else if (selectedCountry !== 'all') {
        // Filter by country - use allRegions for filtering
        filteredBusinesses = filteredBusinesses.filter((b: Business) => {
          if (!b.city) return false;
          
          const businessRegion = (b.city as any)?.region;
          
          // Try to match by region's countryId if available
          if (businessRegion?.countryId) {
            return businessRegion.countryId === selectedCountry;
          }
          
          // Fallback: find region by name and check its countryId
          if (businessRegion?.name) {
            const matchingRegion = allRegions.find(
              (r) => r.name.toLowerCase() === businessRegion.name.toLowerCase() && r.countryId === selectedCountry
            );
            return !!matchingRegion;
          }
          
          // Last resort: check city's region and then region's country
          const cityData = allCities.find((c) => c.id === b.city?.id);
          if (cityData?.regionId) {
            const regionData = allRegions.find((r) => r.id === cityData.regionId);
            return regionData?.countryId === selectedCountry;
          }
          
          return false;
        });
      }

      setBusinesses(filteredBusinesses);
    } catch (error: any) {
      console.error('Error fetching businesses:', error);
      toast.error(error.message || 'Failed to fetch businesses');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleApprove = async (businessId: string) => {
    try {
      await adminService.approveBusiness(businessId);
      toast.success('Business approved successfully');
      fetchBusinesses();
      fetchStats();
    } catch (error: any) {
      console.error('Error approving business:', error);
      toast.error(error.message || 'Failed to approve business');
    }
  };

  const handleReject = async () => {
    if (!actionDialog.businessId) return;

    try {
      await adminService.rejectBusiness(actionDialog.businessId);
      toast.success('Business rejected successfully');
      setActionDialog({ open: false, type: null, businessId: null });
      fetchBusinesses();
      fetchStats();
    } catch (error: any) {
      console.error('Error rejecting business:', error);
      toast.error(error.message || 'Failed to reject business');
    }
  };

  const handleSuspend = async () => {
    if (!actionDialog.businessId) return;

    try {
      await adminService.suspendBusiness(actionDialog.businessId);
      toast.success('Business suspended successfully');
      setActionDialog({ open: false, type: null, businessId: null });
      fetchBusinesses();
      fetchStats();
    } catch (error: any) {
      console.error('Error suspending business:', error);
      toast.error(error.message || 'Failed to suspend business');
    }
  };

  const handleToggleVerified = async (businessId: string, isVerified: boolean) => {
    try {
      await adminService.toggleVerifiedStatus(businessId, isVerified);
      toast.success(isVerified ? 'Business verified successfully' : 'Verified tag removed successfully');
      fetchBusinesses();
    } catch (error: any) {
      console.error('Error toggling verified status:', error);
      toast.error(error.message || 'Failed to update verified status');
    }
  };


  const handleEdit = (businessId: string) => {
    router.push(`/admin/businesses/edit/${businessId}`);
  };

  const handleBulkExport = (selectedRows: Business[]) => {
    const dataToExport = selectedRows.length > 0 ? selectedRows : businesses;
    
    const headers = [
      'ID',
      'Name',
      'Slug',
      'Owner Name',
      'Owner Email',
      'Category',
      'City',
      'Region',
      'Status',
      'Created At',
    ];

    const rows = dataToExport.map((business) => [
      business.id,
      business.name,
      business.slug,
      `${business.user?.firstName || ''} ${business.user?.lastName || ''}`,
      business.user?.email || '',
      business.category?.name || '',
      business.city?.name || '',
      business.city?.region?.name || '',
      business.status,
      new Date(business.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `businesses-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success(`Exported ${dataToExport.length} business${dataToExport.length !== 1 ? 'es' : ''} to CSV`);
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedCountry('all');
    setSelectedRegion('all');
    setSelectedCity('all');
  };

  const hasActiveFilters = selectedCategory !== 'all' || selectedCountry !== 'all' || 
    selectedRegion !== 'all' || selectedCity !== 'all';

  const columns = createColumns(
    (businessId) => handleApprove(businessId),
    (businessId) => setActionDialog({ open: true, type: 'reject', businessId }),
    (businessId) => setActionDialog({ open: true, type: 'suspend', businessId }),
    handleEdit,
    handleToggleVerified,
    activeTab
  );

  const tabs = [
    { id: 'all', label: 'All Businesses' },
    {
      id: 'pending',
      label: 'Pending',
      badge: stats.pending > 0 ? stats.pending : undefined,
    },
    { id: 'suspended', label: 'Suspended' },
    { id: 'approved', label: 'Approved' },
    { id: 'rejected', label: 'Rejected' },
  ] as const;

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#1c4233]" />
      </div>
    );
  }

  return (
    <div className="py-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Businesses Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage all businesses, approvals, and suspensions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-[#1c4233] rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Total Businesses</p>
          <p className="text-3xl font-bold mt-1">{stats.total}</p>
        </div>
        <div className="bg-[#245240] rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Pending Approvals</p>
          <p className="text-3xl font-bold mt-1">{stats.pending}</p>
        </div>
        <div className="bg-[#2d624d] rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Approved</p>
          <p className="text-3xl font-bold mt-1">{stats.approved}</p>
        </div>
        <div className="bg-[#36725a] rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Suspended</p>
          <p className="text-3xl font-bold mt-1">{stats.suspended}</p>
        </div>
        <div className="bg-[#3d7e65] rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Rejected</p>
          <p className="text-3xl font-bold mt-1">{stats.rejected}</p>
        </div>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as TabType)}
              className={`relative py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-[#1c4233] text-[#1c4233] dark:border-green-400 dark:text-green-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <span>{tab.label}</span>
              {'badge' in tab && tab.badge !== undefined && tab.badge > 0 && (
                <Badge
                  variant="destructive"
                  className="h-5 min-w-5 px-1.5 rounded-full flex items-center justify-center text-xs font-semibold"
                >
                  {tab.badge > 99 ? '99+' : tab.badge}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        <BusinessesTable
          columns={columns}
          data={businesses}
          onSearchChange={setSearchInput}
          searchValue={searchInput}
          onBulkExport={handleBulkExport}
          selectedCategory={selectedCategory}
          selectedCountry={selectedCountry}
          selectedRegion={selectedRegion}
          selectedCity={selectedCity}
          categories={categories}
          loading={searchLoading}
          countries={countries}
          regions={regions}
          cities={cities}
          loadingFilters={loadingFilters}
          onCategoryChange={setSelectedCategory}
          onCountryChange={setSelectedCountry}
          onRegionChange={setSelectedRegion}
          onCityChange={setSelectedCity}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      <AlertDialog
        open={actionDialog.open && actionDialog.type === 'reject'}
        onOpenChange={(open) =>
          !open && setActionDialog({ open: false, type: null, businessId: null })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Business?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this business? This action will mark the business as
              rejected and notify the owner.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              className="bg-red-600 hover:bg-red-700"
            >
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={actionDialog.open && actionDialog.type === 'suspend'}
        onOpenChange={(open) =>
          !open && setActionDialog({ open: false, type: null, businessId: null })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend Business?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to suspend this business? This will hide it from public view
              until it's approved again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSuspend}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Suspend
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}