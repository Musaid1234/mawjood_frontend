import { useState, useEffect } from 'react';
import { City as CityType } from '@/services/city.service';
import { cityService } from '@/services/city.service';

interface UseGeolocationProps {
  cities: CityType[];
  selectedCity: CityType | null;
  selectedLocation: any;
  setSelectedCity: (city: CityType | null) => void;
}

export function useGeolocation({ cities, selectedCity, selectedLocation, setSelectedCity }: UseGeolocationProps) {
  const [geoAttempted, setGeoAttempted] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  useEffect(() => {
    const trySelectDefault = () => {
      const riyadh = cities.find((city) =>
        city.name.toLowerCase().includes('riyadh') || city.name.toLowerCase().includes('الرياض')
      );
      if (riyadh) {
        setSelectedCity(riyadh);
        return;
      }
      if (cities[0]) {
        setSelectedCity(cities[0]);
      }
    };

    const matchCityByName = (name?: string): CityType | undefined => {
      if (!name) return undefined;
      const normalized = name.toLowerCase();
      return (
        cities.find((city) => city.name.toLowerCase() === normalized) ||
        cities.find((city) => city.slug.toLowerCase() === normalized) ||
        cities.find((city) => city.name.toLowerCase().includes(normalized))
      );
    };

    const fetchCityFromUnified = async (term: string): Promise<CityType | undefined> => {
      try {
        const result = await cityService.unifiedSearch(term);
        if (result.cities.length > 0) {
          return result.cities[0];
        }
        if (result.regions.length > 0) {
          const regionMatch = cities.find((city) => city.region?.id === result.regions[0].id);
          if (regionMatch) return regionMatch;
        }
      } catch (error) {
        console.error('Unified location search error:', error);
      }
      return undefined;
    };

    const selectCityFromAddress = async (address: any) => {
      const possibleCityNames = [
        address?.city,
        address?.town,
        address?.village,
        address?.municipality,
      ];

      let match: CityType | undefined;

      // Try direct name match
      for (const name of possibleCityNames) {
        match = matchCityByName(name);
        if (match) break;
      }

      // Try unified search
      if (!match) {
        for (const name of possibleCityNames) {
          if (!name) continue;
          match = await fetchCityFromUnified(name);
          if (match) break;
        }
      }

      if (match) {
        setSelectedCity(match);
      } else {
        trySelectDefault();
      }
    };

    const isDefaultSelection =
      !selectedLocation ||
      (selectedLocation.type === 'city' &&
        (selectedLocation.name.toLowerCase().includes('riyadh') ||
          selectedLocation.name.toLowerCase().includes('الرياض')));

    if (typeof window === 'undefined' || geoAttempted || geoLoading || !cities.length) {
      return;
    }

    if (!isDefaultSelection) {
      setGeoAttempted(true);
      return;
    }

    if (!navigator.geolocation) {
      setGeoAttempted(true);
      trySelectDefault();
      return;
    }

    setGeoAttempted(true);
    setGeoLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          if (!response.ok) {
            throw new Error('Failed to reverse geocode location');
          }

          const data = await response.json();
          await selectCityFromAddress(data?.address);
        } catch (error) {
          console.error('Geolocation lookup error:', error);
          trySelectDefault();
        } finally {
          setGeoLoading(false);
        }
      },
      (error) => {
        console.warn('Geolocation permission denied or unavailable:', error);
        setGeoLoading(false);
        trySelectDefault();
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 5 * 60 * 1000,
      }
    );
  }, [cities, selectedCity, selectedLocation, geoAttempted, geoLoading, setSelectedCity]);

  return { geoAttempted, geoLoading };
}