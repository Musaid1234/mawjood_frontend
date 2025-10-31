export interface City {
    id: string;
    name: string;
    slug: string;
    regionId: string;
    region?: {
      id: string;
      name: string;
      slug: string;
    };
  }
  
  export interface CityResponse {
    success: boolean;
    message: string;
    data: City[];
  }
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  
  export const cityService = {
    async fetchCities(): Promise<City[]> {
      try {
        const response = await fetch(`${API_BASE_URL}/api/cities`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const data: CityResponse = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch cities');
        }
  
        return data.data;
      } catch (error) {
        console.error('Error fetching cities:', error);
        throw error;
      }
    },
  
    async fetchCityBySlug(slug: string): Promise<City | null> {
      try {
        const response = await fetch(`${API_BASE_URL}/api/cities/slug/${slug}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch city');
        }
  
        return data.data;
      } catch (error) {
        console.error('Error fetching city:', error);
        throw error;
      }
    }
  };