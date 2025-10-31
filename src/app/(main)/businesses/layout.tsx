import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Browse Businesses | Mawjood - Find Local Services',
  description: 'Discover and explore the best local businesses and services in Saudi Arabia. Browse verified listings, read reviews, and find top-rated businesses near you.',
  keywords: 'local businesses, services, Saudi Arabia, business listings, reviews, verified businesses, find services',
  openGraph: {
    title: 'Browse Businesses | Mawjood',
    description: 'Discover the best local businesses and services in Saudi Arabia',
    type: 'website',
  },
};

export default function BusinessesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}