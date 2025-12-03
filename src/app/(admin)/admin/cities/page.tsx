'use client';

import { useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MoreHorizontal, Plus, MapPin, Map, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CitiesTable } from '@/components/admin/cities/CitiesTable';
import { CityDialog } from '@/components/admin/cities/CityDialog';
import { RegionDialog } from '@/components/admin/cities/RegionDialog';
import { cityService, City, Region, Country } from '@/services/city.service';
import { toast } from 'sonner';
import { CountryDialog } from '@/components/admin/cities/CountryDialog';
import { Checkbox } from '@/components/ui/checkbox';
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

export default function CitiesPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [filteredRegions, setFilteredRegions] = useState<Region[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [regionSearchValue, setRegionSearchValue] = useState('');
  const [countrySearchValue, setCountrySearchValue] = useState('');
  
  const [cityDialogOpen, setCityDialogOpen] = useState(false);
  const [regionDialogOpen, setRegionDialogOpen] = useState(false);
  const [countryDialogOpen, setCountryDialogOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  
  // Delete confirmation dialogs
  const [deleteCityDialog, setDeleteCityDialog] = useState<{ open: boolean; cityId: string | null }>({
    open: false,
    cityId: null,
  });
  const [deleteRegionDialog, setDeleteRegionDialog] = useState<{ open: boolean; regionId: string | null }>({
    open: false,
    regionId: null,
  });
  const [deleteCountryDialog, setDeleteCountryDialog] = useState<{ open: boolean; countryId: string | null }>({
    open: false,
    countryId: null,
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterCities();
  }, [cities, searchValue, selectedRegion, selectedCountry]);

  useEffect(() => {
    filterRegions();
  }, [regions, regionSearchValue, selectedCountry]);

  useEffect(() => {
    filterCountries();
  }, [countries, countrySearchValue]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [citiesData, regionsData, countriesData] = await Promise.all([
        cityService.fetchCities(),
        cityService.fetchRegions(),
        cityService.fetchCountries(),
      ]);
      setCities(citiesData);
      setRegions(regionsData);
      setCountries(countriesData);
    } catch {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const filterCities = () => {
    let filtered = cities;

    // Filter by search
    if (searchValue) {
      filtered = filtered.filter((city) =>
        city.name.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    // Filter by region
    if (selectedRegion && selectedRegion !== 'all') {
      filtered = filtered.filter((city) => city.regionId === selectedRegion);
    }

    // Filter by country
    if (selectedCountry && selectedCountry !== 'all') {
      filtered = filtered.filter((city) => {
        const region = regions.find((r) => r.id === city.regionId);
        return region?.countryId === selectedCountry;
      });
    }

    setFilteredCities(filtered);
  };

  const filterRegions = () => {
    let filtered = regions;

    // Filter by search
    if (regionSearchValue) {
      filtered = filtered.filter((region) =>
        region.name.toLowerCase().includes(regionSearchValue.toLowerCase())
      );
    }

    // Filter by country
    if (selectedCountry && selectedCountry !== 'all') {
      filtered = filtered.filter((region) => region.countryId === selectedCountry);
    }

    setFilteredRegions(filtered);
  };

  const filterCountries = () => {
    let filtered = countries;

    // Filter by search
    if (countrySearchValue) {
      filtered = filtered.filter((country) =>
        country.name.toLowerCase().includes(countrySearchValue.toLowerCase()) ||
        country.slug.toLowerCase().includes(countrySearchValue.toLowerCase()) ||
        (country.code && country.code.toLowerCase().includes(countrySearchValue.toLowerCase()))
      );
    }

    setFilteredCountries(filtered);
  };

  const handleCreateCity = () => {
    setEditingCity(null);
    setCityDialogOpen(true);
  };

  const handleEditCity = (city: City) => {
    setEditingCity(city);
    setCityDialogOpen(true);
  };

  const handleSaveCity = async (cityData: { name: string; slug: string; regionId: string }) => {
    try {
      if (editingCity) {
        await cityService.updateCity(editingCity.id, cityData);
        toast.success('City updated successfully!');
      } else {
        await cityService.createCity(cityData);
        toast.success('City created successfully!');
      }
      
      await fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save city');
      throw error;
    }
  };

  const handleDeleteCity = (id: string) => {
    setDeleteCityDialog({ open: true, cityId: id });
  };

  const confirmDeleteCity = async () => {
    if (!deleteCityDialog.cityId) return;

    try {
      await cityService.deleteCity(deleteCityDialog.cityId);
      toast.success('City deleted successfully!');
      setDeleteCityDialog({ open: false, cityId: null });
      await fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete city');
    }
  };

  const handleSaveRegion = async (regionData: { name: string; slug: string; countryId: string }) => {
    try {
      if (!regionData.countryId) {
        toast.error('Please select a country');
        throw new Error('Country is required');
      }

      if (editingRegion) {
        await cityService.updateRegion(editingRegion.id, regionData);
        toast.success('Region updated successfully!');
      } else {
        await cityService.createRegion(regionData);
        toast.success('Region created successfully!');
      }
      
      await fetchData();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${editingRegion ? 'update' : 'create'} region`);
      throw error;
    }
  };

  const handleSaveCountry = async (countryData: { name: string; slug: string; code?: string }) => {
    try {
      if (editingCountry) {
        await cityService.updateCountry(editingCountry.id, countryData);
        toast.success('Country updated successfully!');
      } else {
        await cityService.createCountry(countryData);
        toast.success('Country created successfully!');
      }
      await fetchData();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${editingCountry ? 'update' : 'create'} country`);
      throw error;
    }
  };

  const handleEditRegion = (region: Region) => {
    setEditingRegion(region);
    setRegionDialogOpen(true);
  };

  const handleEditCountry = (country: Country) => {
    setEditingCountry(country);
    setCountryDialogOpen(true);
  };

  const handleDeleteRegion = (id: string) => {
    const citiesInRegion = cities.filter(c => c.regionId === id).length;

    if (citiesInRegion > 0) {
      toast.error(`This region has ${citiesInRegion} cities. Please delete or reassign them first.`);
      return;
    }

    setDeleteRegionDialog({ open: true, regionId: id });
  };

  const confirmDeleteRegion = async () => {
    if (!deleteRegionDialog.regionId) return;

    try {
      await cityService.deleteRegion(deleteRegionDialog.regionId);
      toast.success('Region deleted successfully!');
      setDeleteRegionDialog({ open: false, regionId: null });
      await fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete region');
    }
  };

  const handleDeleteCountry = (id: string) => {
    const regionsInCountry = regions.filter((region) => region.countryId === id).length;

    if (regionsInCountry > 0) {
      toast.error(`This country has ${regionsInCountry} ${regionsInCountry === 1 ? 'region' : 'regions'}. Please delete or reassign them first.`);
      return;
    }

    setDeleteCountryDialog({ open: true, countryId: id });
  };

  const confirmDeleteCountry = async () => {
    if (!deleteCountryDialog.countryId) return;

    try {
      await cityService.deleteCountry(deleteCountryDialog.countryId);
      toast.success('Country deleted successfully!');
      setDeleteCountryDialog({ open: false, countryId: null });
      await fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete country');
    }
  };

  const cityColumns: ColumnDef<City>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: 'City Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'slug',
      header: 'Slug',
      cell: ({ row }) => (
        <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
          {row.original.slug}
        </code>
      ),
    },
    {
      accessorKey: 'region',
      header: 'State',
      cell: ({ row }) => (
        <Badge variant="secondary">
          {row.original.region?.name || 'Unknown'}
        </Badge>
      ),
    },
    {
      accessorKey: 'country',
      header: 'Country',
      cell: ({ row }) => {
        const region = regions.find((r) => r.id === row.original.regionId);
        const country = region ? countries.find((c) => c.id === region.countryId) : null;
        return (
          <Badge variant="outline">
            {country?.name || 'Unknown'}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const city = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleEditCity(city)}>
                Edit City
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDeleteCity(city.id)}
                className="text-red-600"
              >
                Delete City
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Locations</h1>
          <p className="text-gray-600 mt-1">
            Manage cities and States across the platform
          </p>
        </div>
      </div>

      <Tabs defaultValue="cities" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cities" className="gap-2">
            <MapPin className="w-4 h-4" />
            Cities ({cities.length})
          </TabsTrigger>
          <TabsTrigger value="regions" className="gap-2">
            <Map className="w-4 h-4" />
            States ({regions.length})
          </TabsTrigger>
          <TabsTrigger value="countries" className="gap-2">
            <Map className="w-4 h-4" />
            Countries ({countries.length})
          </TabsTrigger>
        </TabsList>

        {/* Cities Tab */}
        <TabsContent value="cities" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Cities</CardTitle>
                  <CardDescription>
                    View and manage all cities in the system
                  </CardDescription>
                </div>
                <Button onClick={handleCreateCity}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add City
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <CitiesTable
                columns={cityColumns}
                data={filteredCities}
                onSearchChange={setSearchValue}
                onRegionFilter={setSelectedRegion}
                onCountryFilter={setSelectedCountry}
                searchValue={searchValue}
                regions={regions}
                countries={countries}
                selectedCountry={selectedCountry}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Regions Tab */}
        <TabsContent value="regions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All States</CardTitle>
                  <CardDescription>
                    Manage states to organize cities
                  </CardDescription>
                </div>
                <Button
                  onClick={() => {
                    if (countries.length === 0) {
                      toast.error('Please create a country before adding States.');
                      return;
                    }
                    setEditingRegion(null);
                    setRegionDialogOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add State
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search states..."
                    value={regionSearchValue}
                    onChange={(e) => setRegionSearchValue(e.target.value)}
                    className="pl-10"
                  />
                </div>
                  <Select
                  value={selectedCountry}
                  onValueChange={setSelectedCountry}
                >
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Filter by country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    {countries.map((country) => (
                      <SelectItem key={country.id} value={country.id}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredRegions.map((region) => {
                  const citiesCount = cities.filter(
                    (c) => c.regionId === region.id
                  ).length;
                  const country = countries.find((c) => c.id === region.countryId);

                  return (
                    <Card key={region.id} className="relative">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Map className="w-5 h-5 text-primary" />
                            <div>
                              <CardTitle className="text-lg">
                                {region.name}
                              </CardTitle>
                              {country && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {country.name}
                                </p>
                              )}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleEditRegion(region)}>
                                Edit State
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteRegion(region.id)}
                                className="text-red-600"
                              >
                                Delete State
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded inline-block">
                          {region.slug}
                        </code>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-gray-600">
                          <span className="font-semibold">{citiesCount}</span>{' '}
                          {citiesCount === 1 ? 'city' : 'cities'}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {filteredRegions.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    {regions.length === 0 
                      ? 'No States yet. Create your first state to get started.'
                      : 'No states found matching your search criteria.'}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="countries" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Countries</CardTitle>
                  <CardDescription>
                    Manage countries available in the platform
                  </CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setEditingCountry(null);
                    setCountryDialogOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Country
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search countries..."
                    value={countrySearchValue}
                    onChange={(e) => setCountrySearchValue(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredCountries.map((country) => {
                  const countryRegions = regions.filter((region) => region.countryId === country.id);
                  const cityCount = countryRegions.reduce(
                    (sum, region) => sum + cities.filter((city) => city.regionId === region.id).length,
                    0
                  );

                  return (
                    <Card key={country.id} className="relative">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{country.name}</CardTitle>
                            <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded inline-block mt-1">
                              {country.slug}
                            </code>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleEditCountry(country)}>
                                Edit Country
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteCountry(country.id)}
                                className="text-red-600"
                              >
                                Delete Country
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm text-gray-600">
                          <p>
                            <span className="font-semibold">{countryRegions.length}</span>{' '}
                            {countryRegions.length === 1 ? 'state' : 'states'}
                          </p>
                          <p>
                            <span className="font-semibold">{cityCount}</span>{' '}
                            {cityCount === 1 ? 'city' : 'cities'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {filteredCountries.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    {countries.length === 0 
                      ? 'No countries yet. Create your first country to get started.'
                      : 'No countries found matching your search criteria.'}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CityDialog
        open={cityDialogOpen}
        onOpenChange={setCityDialogOpen}
        city={editingCity}
        regions={regions}
        onSave={handleSaveCity}
      />

      <RegionDialog
        open={regionDialogOpen}
        onOpenChange={(open) => {
          setRegionDialogOpen(open);
          if (!open) setEditingRegion(null);
        }}
        countries={countries}
        defaultCountryId={countries[0]?.id}
        region={editingRegion}
        onSave={handleSaveRegion}
      />

      <CountryDialog
        open={countryDialogOpen}
        onOpenChange={(open) => {
          setCountryDialogOpen(open);
          if (!open) setEditingCountry(null);
        }}
        country={editingCountry}
        onSave={handleSaveCountry}
      />

      {/* Delete City Confirmation Dialog */}
      <AlertDialog
        open={deleteCityDialog.open}
        onOpenChange={(open) => setDeleteCityDialog({ open, cityId: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete City?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this city? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCity}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Region Confirmation Dialog */}
      <AlertDialog
        open={deleteRegionDialog.open}
        onOpenChange={(open) => setDeleteRegionDialog({ open, regionId: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete State?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this state? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteRegion}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Country Confirmation Dialog */}
      <AlertDialog
        open={deleteCountryDialog.open}
        onOpenChange={(open) => setDeleteCountryDialog({ open, countryId: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Country?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this country? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCountry}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
