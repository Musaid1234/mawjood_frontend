import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { cityService, City } from '@/services/city.service';

interface CityState {
  cities: City[];
  selectedCity: City | null;
  loading: boolean;
  error: string | null;
  hasLoaded: boolean;
  fetchCities: () => Promise<void>;
  setSelectedCity: (city: City | null) => void;
}

export const useCityStore = create<CityState>()(
  devtools(
    persist(
      (set, get) => ({
        cities: [],
        selectedCity: null,
        loading: false,
        error: null,
        hasLoaded: false,

        fetchCities: async () => {
          const { loading } = get();
  
          if (loading) return;

          set({ loading: true, error: null });

          try {
            const cities = await cityService.fetchCities();
            
            set({ 
              cities, 
              loading: false, 
              hasLoaded: true 
            });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to fetch cities',
              loading: false 
            });
          }
        },

        setSelectedCity: (city) => {
          set({ selectedCity: city });
        },
      }),
      {
        name: 'city-storage',
        partialize: (state) => ({ 
          selectedCity: state.selectedCity,
        }),
      }
    ),
    {
      name: 'city-store',
    }
  )
);