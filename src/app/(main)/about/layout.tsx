import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'About Us | Mawjood',
  description: 'About us page',
  keywords: 'about us, Mawjood',
  openGraph: {
    title: 'About Us | Mawjood',
    description: 'About us page',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us | Mawjood',
    description: 'About us page',
    images: ['/og-default.jpg'],
  },
  alternates: {
    canonical: '/about',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AboutLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}