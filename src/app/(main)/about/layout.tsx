import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'About Us | Mawjood',
  description: 'Learn about Mawjood - your trusted platform connecting businesses and customers across Saudi Arabia. Discover our mission, vision, and values.',
  keywords: 'about us, Mawjood, business directory, Saudi Arabia, local businesses, company information',
  openGraph: {
    title: 'About Us | Mawjood',
    description: 'Learn about Mawjood - your trusted platform connecting businesses and customers across Saudi Arabia. Discover our mission, vision, and values.',
    type: 'website',
    url: '/about',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200',
        width: 1200,
        height: 630,
        alt: 'About Mawjood - Team and Mission',
      },
      {
        url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200',
        width: 1200,
        height: 630,
        alt: 'Mawjood Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us | Mawjood',
    description: 'Learn about Mawjood - your trusted platform connecting businesses and customers across Saudi Arabia.',
    images: ['https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200'],
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