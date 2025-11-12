import { useQuery } from '@tanstack/react-query';
import { settingsService, SiteSettings } from '@/services/settings.service';

export const useSiteSettings = () =>
  useQuery<SiteSettings>({
    queryKey: ['site-settings'],
    queryFn: settingsService.fetchSiteSettings,
    staleTime: 1000 * 60 * 10,
  });

