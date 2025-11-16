import { useQuery } from '@tanstack/react-query';
import { settingsService } from '@/services/settings.service';

/**
 * Hook to get currency from site settings
 * Returns the currency code (default: 'SAR') and loading state
 */
export const useCurrency = () => {
  const { data: settings, isLoading } = useQuery({
    queryKey: ['site-settings'], // Match useSiteSettings query key for cache sharing
    queryFn: () => settingsService.fetchSiteSettings(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });

  const currency = (settings as { currency?: string })?.currency || 'SAR';

  return {
    currency,
    isLoading,
  };
};

