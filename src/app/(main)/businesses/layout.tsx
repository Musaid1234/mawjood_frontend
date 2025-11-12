import { Metadata } from 'next';
import { ReactNode } from 'react';
import { buildOgImages, toAbsoluteUrl } from '@/config/seo.config';

const { absolute: businessesOgImage } = buildOgImages();

export const metadata: Metadata = {
  title: 'Browse Businesses | Mawjood - Find Local Services',
  description: 'Discover and explore the best local businesses and services in Saudi Arabia. Browse verified listings, read reviews, and find top-rated businesses near you.',
  keywords: 'local businesses, services, Saudi Arabia, business listings, reviews, verified businesses, find services',
  openGraph: {
    title: 'Browse Businesses | Mawjood',
    description: 'Discover the best local businesses and services in Saudi Arabia',
    type: 'website',
    locale: 'en_US',
    siteName: 'Mawjood',
    url: toAbsoluteUrl('/businesses'),
    images: [
      {
        url: businessesOgImage,
        width: 1200,
        height: 630,
        alt: 'Mawjood Businesses',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Browse Businesses | Mawjood',
    description: 'Discover the best local businesses and services in Saudi Arabia',
    images: [businessesOgImage],
  },
  alternates: {
    canonical: toAbsoluteUrl('/businesses'),
  },
};

export default function BusinessesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}