import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { cityService, City, Region, Country } from '@/services/city.service';

export type LocationSelection = {
  type: 'city' | 'region' | 'country';
  slug: string;
  name: string;
  id?: string;
  regionId?: string;
};

interface CityState {
  cities: City[];
  regions: Region[];
  countries: Country[];
  selectedCity: City | null;
  selectedLocation: LocationSelection | null;
  loading: boolean;
  error: string | null;
  hasLoaded: boolean;
  fetchCities: () => Promise<void>;
  fetchRegions: () => Promise<void>;
  fetchCountries: () => Promise<void>;
  setSelectedCity: (city: City | null) => void;
  setSelectedLocation: (location: LocationSelection | null) => void;
}

const isSameLocation = (
  a: LocationSelection | null,
  b: LocationSelection | null
): boolean => {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return (
    a.type === b.type &&
    a.slug === b.slug &&
    a.name === b.name &&
    a.id === b.id &&
    a.regionId === b.regionId
  );
};

export const useCityStore = create<CityState>()(
  devtools(
    persist(
      (set, get) => ({
        cities: [],
        regions: [],
        countries: [],
        selectedCity: null,
        selectedLocation: null,
        loading: false,
        error: null,
        hasLoaded: false,

        fetchCities: async () => {
          const { loading } = get();
          if (loading) return;

          set({ loading: true, error: null });

          try {
            const cities = await cityService.fetchCities();

            set((state) => ({
              cities,
              loading: false,
              hasLoaded: true,
              selectedCity: state.selectedCity
                ? cities.find((city) => city.id === state.selectedCity?.id) || state.selectedCity
                : cities[0] || null,
              selectedLocation: state.selectedLocation
                ? state.selectedLocation
                : cities[0]
                ? {
                    type: 'city',
                    slug: cities[0].slug,
                    name: cities[0].name,
                    id: cities[0].id,
                    regionId: cities[0].regionId,
                  }
                : null,
            }));
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to fetch cities',
              loading: false,
            });
          }
        },

        fetchRegions: async () => {
          try {
            const regions = await cityService.fetchRegions();
            set({ regions });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to fetch regions',
            });
          }
        },

        fetchCountries: async () => {
          try {
            const countries = await cityService.fetchCountries();
            set({ countries });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to fetch countries',
            });
          }
        },

        setSelectedCity: (city) => {
          set((state) => {
            const newLocation = city
              ? {
                  type: 'city' as const,
                  slug: city.slug,
                  name: city.name,
                  id: city.id,
                  regionId: city.regionId,
                }
              : null;

            const locationChanged = !isSameLocation(state.selectedLocation, newLocation);

            if (!locationChanged && state.selectedCity === city) {
              return state;
            }

            return {
              selectedCity: city,
              selectedLocation: locationChanged ? newLocation : state.selectedLocation,
            };
          });
        },

        setSelectedLocation: (location) => {
          set((state) => {
            if (isSameLocation(state.selectedLocation, location)) {
              return state;
            }
            return { selectedLocation: location };
          });
        },
      }),
      {
        name: 'city-storage',
        partialize: (state) => ({
          selectedCity: state.selectedCity,
          selectedLocation: state.selectedLocation,
        }),
      }
    ),
    {
      name: 'city-store',
    }
  )
);