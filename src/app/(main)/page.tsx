'use client'
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import AppDownloadBanner from '@/components/home/AppDownloadBanner';
import HeroSection from '@/components/home/HeroSection';
import CategoryListing from '@/components/home/CategoryListing';
import FeaturedServices from '@/components/home/FeaturedServices';
import FeaturedListings from '@/components/home/FeaturedListings';
import Reviews from '@/components/home/Reviews';
import Blogs from '@/components/home/Blogs';

export default function Home() {
    const { t, i18n } = useTranslation('common');

  return (
    <div className="font-sans">
      <HeroSection />
      <CategoryListing/>
      <FeaturedServices />
      <FeaturedListings />
      <Reviews />
      <Blogs />
      <AppDownloadBanner />
    </div>
  );
}