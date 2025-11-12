import axiosInstance from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api.config';

export interface HeroCardSettings {
  id: string;
  title: string;
  buttonText?: string;
  buttonColor?: string;
  image?: string;
  slug: string;
}

export interface HeroSettings {
  title?: string;
  subtitle?: string;
  cards?: HeroCardSettings[];
}

export interface NavbarSettings {
  logoUrl?: string;
  brandName?: string;
  tagline?: string;
}

export interface FeaturedSectionCard {
  id: string;
  name: string;
  image?: string;
  slug: string;
  description?: string;
}

export interface FeaturedSectionSettings {
  id: string;
  title: string;
  subtitle?: string;
  layout?: 'grid' | 'carousel';
  cardsPerRow?: number;
  items?: FeaturedSectionCard[];
}

export interface ReviewSettings {
  id: number | string;
  name: string;
  designation?: string;
  rating?: number;
  comment: string;
  avatar?: string;
}

export interface DownloadBannerSettings {
  title?: string;
  subtitle?: string;
  appStoreUrl?: string;
  playStoreUrl?: string;
  metrics?: Array<{ label: string; value: string }>;
}

export interface FooterLink {
  label: string;
  url: string;
}

export interface FooterSocialLink {
  name: string;
  url: string;
  icon?: string;
}

export interface FooterSettings {
  companyName?: string;
  tagline?: string;
  quickLinks?: FooterLink[];
  businessLinks?: FooterLink[];
  socialLinks?: FooterSocialLink[];
}

export interface AboutHeroStat {
  icon?: string;
  label: string;
}

export interface AboutValue {
  icon?: string;
  title: string;
  description: string;
}

export interface AboutStat {
  label: string;
  value: string;
}

export interface AboutSettings {
  hero?: {
    title?: string;
    subtitle?: string;
    stats?: AboutHeroStat[];
  };
  mission?: { title?: string; description?: string };
  vision?: { title?: string; description?: string };
  story?: { title?: string; paragraphs?: string[] };
  values?: AboutValue[];
  stats?: AboutStat[];
}

export interface ContactSettings {
  emails?: string[];
  phones?: string[];
  socialLinks?: FooterSocialLink[];
  location?: {
    address?: string;
    latitude?: number;
    longitude?: number;
  };
}

export interface SiteSettings {
  hero?: HeroSettings;
  navbar?: NavbarSettings;
  featuredSections?: FeaturedSectionSettings[];
  reviews?: ReviewSettings[];
  downloadBanner?: DownloadBannerSettings;
  footer?: FooterSettings;
  about?: AboutSettings;
  contact?: ContactSettings;
  [key: string]: unknown;
}

export const settingsService = {
  async fetchSiteSettings(): Promise<SiteSettings> {
    const response = await axiosInstance.get<{ data: SiteSettings }>(API_ENDPOINTS.SETTINGS.SITE);
    return response.data.data ?? {};
  },

  async updateSiteSettings(payload: Partial<SiteSettings>): Promise<SiteSettings> {
    const response = await axiosInstance.put<{ data: SiteSettings }>(
      API_ENDPOINTS.SETTINGS.SITE,
      payload
    );
    return response.data.data ?? {};
  },
};

