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

    const reverseGeocode = async (latitude: number, longitude: number): Promise<any> => {
      // Try BigDataCloud API first (free, no API key needed, no rate limits for reasonable use)
      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        if (response.ok) {
          const data = await response.json();
          return {
            address: {
              city: data.city || data.locality,
              town: data.town,
              village: data.village,
              municipality: data.municipality,
              state: data.principalSubdivision,
              country: data.countryName,
            },
          };
        }
      } catch (error) {
        console.warn('BigDataCloud API failed, trying fallback:', error);
      }

      // Fallback to IP-based geolocation if reverse geocoding fails
      try {
        const ipResponse = await fetch('https://ipapi.co/json/');
        if (ipResponse.ok) {
          const ipData = await ipResponse.json();
          return {
            address: {
              city: ipData.city,
              region: ipData.region,
              country: ipData.country_name,
            },
          };
        }
      } catch (error) {
        console.warn('IP geolocation fallback failed:', error);
      }

      throw new Error('All geocoding APIs failed');
    };

    const selectCityFromAddress = async (address: any) => {
      const possibleCityNames = [
        address?.city,
        address?.town,
        address?.village,
        address?.municipality,
        address?.region,
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

    if (typeof window === 'undefined' || !cities.length) {
      return;
    }

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      const riyadh = cities.find((city) =>
        city.name.toLowerCase().includes('riyadh') || city.name.toLowerCase().includes('الرياض')
      );
      if (riyadh && !selectedCity) {
        setSelectedCity(riyadh);
      } else if (cities[0] && !selectedCity) {
        setSelectedCity(cities[0]);
      }
      return;
    }

    const isDefaultSelection =
      !selectedLocation ||
      !selectedCity ||
      (selectedLocation.type === 'city' &&
        (selectedLocation.name.toLowerCase().includes('riyadh') ||
          selectedLocation.name.toLowerCase().includes('الرياض')));

    // ALWAYS request location permission on every page load/visit
    // This ensures the browser prompt appears every time (browser will handle if already granted/denied)
    setGeoLoading(true);

    let watchId: number | null = null;
    let fallbackTimeout: NodeJS.Timeout | null = null;

    // Use watchPosition first to trigger permission prompt, then getCurrentPosition
    watchId = navigator.geolocation.watchPosition(
      (position) => {
        // Stop watching once we get position
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId);
          watchId = null;
        }
        if (fallbackTimeout) {
          clearTimeout(fallbackTimeout);
          fallbackTimeout = null;
        }
        
        // Now get the current position with better options
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              try {
                const { latitude, longitude } = pos.coords;
                const geocodeData = await reverseGeocode(latitude, longitude);
                // Only update city if it's currently default/unset
                if (isDefaultSelection) {
                  await selectCityFromAddress(geocodeData?.address);
                } else {
                  setGeoLoading(false);
                }
              } catch (error) {
                console.error('Geolocation lookup error:', error);
                if (isDefaultSelection) {
                  trySelectDefault();
                }
                setGeoLoading(false);
              } finally {
                // Ensure loading state is cleared
                if (!isDefaultSelection) {
                  setGeoLoading(false);
                }
              }
            },
          (error) => {
            console.warn('Geolocation error:', error);
            setGeoLoading(false);
            if (isDefaultSelection) {
              trySelectDefault();
            }
          },
          {
            enableHighAccuracy: false,
            timeout: 15000,
            maximumAge: 0, // Always get fresh location
          }
        );
      },
        (error) => {
          // Permission denied or error
          if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            watchId = null;
          }
          if (fallbackTimeout) {
            clearTimeout(fallbackTimeout);
            fallbackTimeout = null;
          }
          console.warn('Geolocation permission denied or unavailable:', error);
          setGeoLoading(false);
          if (isDefaultSelection) {
            trySelectDefault();
          }
        },
      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 0,
      }
    );

    // Fallback timeout - if watchPosition doesn't respond, try getCurrentPosition directly
    fallbackTimeout = setTimeout(() => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }
      if (geoLoading) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              const geocodeData = await reverseGeocode(latitude, longitude);
              // Only update city if it's currently default/unset
              if (isDefaultSelection) {
                await selectCityFromAddress(geocodeData?.address);
              } else {
                setGeoLoading(false);
              }
            } catch (error) {
              console.error('Geolocation lookup error:', error);
              if (isDefaultSelection) {
                trySelectDefault();
              }
              setGeoLoading(false);
            }
          },
          (error) => {
            console.warn('Geolocation error:', error);
            setGeoLoading(false);
            if (isDefaultSelection) {
              trySelectDefault();
            }
          },
          {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      }
    }, 2000);

    // Cleanup function to clear watch and timeout on unmount or dependency change
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (fallbackTimeout) {
        clearTimeout(fallbackTimeout);
      }
    };
  }, [cities, selectedCity, selectedLocation, setSelectedCity]);

  return { geoLoading };
}