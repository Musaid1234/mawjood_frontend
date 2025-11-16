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
import { MoreHorizontal, Plus, Trash2, MapPin, Map } from 'lucide-react';
import { CitiesTable } from '@/components/admin/cities/CitiesTable';
import { CityDialog } from '@/components/admin/cities/CityDialog';
import { RegionDialog } from '@/components/admin/cities/RegionDialog';
import { cityService, City, Region, Country } from '@/services/city.service';
import { toast } from 'sonner';
import { CountryDialog } from '@/components/admin/cities/CountryDialog';

export default function CitiesPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  
  const [cityDialogOpen, setCityDialogOpen] = useState(false);
  const [regionDialogOpen, setRegionDialogOpen] = useState(false);
  const [countryDialogOpen, setCountryDialogOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterCities();
  }, [cities, searchValue, selectedRegion]);

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
    } catch (error) {
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

    setFilteredCities(filtered);
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

  const handleDeleteCity = async (id: string) => {
    if (!confirm('Are you sure you want to delete this city?')) return;

    try {
      await cityService.deleteCity(id);
      toast.success('City deleted successfully!');
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

      await cityService.createRegion(regionData);
      toast.success('Region created successfully!');
      
      await fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create region');
      throw error;
    }
  };

  const handleSaveCountry = async (countryData: { name: string; slug: string; code?: string }) => {
    try {
      await cityService.createCountry(countryData);
      toast.success('Country created successfully!');
      await fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create country');
      throw error;
    }
  };

  const handleDeleteRegion = async (id: string) => {
    const region = regions.find(r => r.id === id);
    const citiesInRegion = cities.filter(c => c.regionId === id).length;

    if (citiesInRegion > 0) {
      toast.error(`This region has ${citiesInRegion} cities. Please delete or reassign them first.`);
      return;
    }

    if (!confirm(`Are you sure you want to delete ${region?.name}?`)) return;

    try {
      await cityService.deleteRegion(id);
      toast.success('Region deleted successfully!');
      await fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete region');
    }
  };

  const handleDeleteCountry = async (id: string) => {
    const country = countries.find((c) => c.id === id);
    const regionsInCountry = regions.filter((region) => region.countryId === id).length;

    if (regionsInCountry > 0) {
      toast.error(`This country has ${regionsInCountry} ${regionsInCountry === 1 ? 'region' : 'regions'}. Please delete or reassign them first.`);
      return;
    }

    if (!confirm(`Are you sure you want to delete ${country?.name ?? 'this country'}?`)) return;

    try {
      await cityService.deleteCountry(id);
      toast.success('Country deleted successfully!');
      await fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete country');
    }
  };

  const cityColumns: ColumnDef<City>[] = [
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
      header: 'Region',
      cell: ({ row }) => (
        <Badge variant="secondary">
          {row.original.region?.name || 'Unknown'}
        </Badge>
      ),
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
            Manage cities and regions across the platform
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
            Regions ({regions.length})
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
                searchValue={searchValue}
                regions={regions}
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
                  <CardTitle>All Regions</CardTitle>
                  <CardDescription>
                    Manage regions to organize cities
                  </CardDescription>
                </div>
                <Button
                  onClick={() => {
                    if (countries.length === 0) {
                      toast.error('Please create a country before adding regions.');
                      return;
                    }
                    setRegionDialogOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Region
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {regions.map((region) => {
                  const citiesCount = cities.filter(
                    (c) => c.regionId === region.id
                  ).length;

                  return (
                    <Card key={region.id} className="relative">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Map className="w-5 h-5 text-primary" />
                            <CardTitle className="text-lg">
                              {region.name}
                            </CardTitle>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleDeleteRegion(region.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
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

                {regions.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    No regions yet. Create your first region to get started.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Countries Tab */}
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
                <Button onClick={() => setCountryDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Country
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {countries.map((country) => {
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
                            {country.code && (
                              <p className="text-xs text-gray-500 mt-1">ISO: {country.code}</p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleDeleteCountry(country.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm text-gray-600">
                          <p>
                            <span className="font-semibold">{countryRegions.length}</span>{' '}
                            {countryRegions.length === 1 ? 'region' : 'regions'}
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

                {countries.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    No countries yet. Create your first country to get started.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CityDialog
        open={cityDialogOpen}
        onOpenChange={setCityDialogOpen}
        city={editingCity}
        regions={regions}
        onSave={handleSaveCity}
      />

      <RegionDialog
        open={regionDialogOpen}
        onOpenChange={setRegionDialogOpen}
        countries={countries}
        defaultCountryId={countries[0]?.id}
        onSave={handleSaveRegion}
      />

      <CountryDialog
        open={countryDialogOpen}
        onOpenChange={setCountryDialogOpen}
        onSave={handleSaveCountry}
      />
    </div>
  );
}
