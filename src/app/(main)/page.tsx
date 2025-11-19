'use client'
import { useTranslation } from 'react-i18next';
import AppDownloadBanner from '@/components/home/AppDownloadBanner';
import HeroSection from '@/components/home/HeroSection';
import CategoryListing from '@/components/home/CategoryListing';
import FeaturedServices from '@/components/home/FeaturedServices';
import AdvertisementBanner from '@/components/home/AdvertisementBanner';
import FeaturedListings from '@/components/home/FeaturedListings';
import Reviews from '@/components/home/Reviews';
import Blogs from '@/components/home/Blogs';
import QuickLinks from '@/components/home/QuickLinks';

export default function Home() {
    const { t, i18n } = useTranslation('common');

  return (
    <div className="font-sans">
      <HeroSection />
      <CategoryListing/>
      <AdvertisementBanner />
      <FeaturedServices />
      <FeaturedListings />
      <AdvertisementBanner />
      <Reviews />
      <Blogs />
      <QuickLinks />
      <AppDownloadBanner />
    </div>
  );
}