import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { buildOgImages, toAbsoluteUrl } from '@/config/seo.config';

const { absolute: categoriesOgImage } = buildOgImages();

export const metadata: Metadata = {
  title: 'Categories - Mawjood',
  description: 'Browse all business categories',
  openGraph: {
    title: 'Categories - Mawjood',
    description: 'Browse all business categories',
    type: 'website',
    siteName: 'Mawjood',
    url: toAbsoluteUrl('/categories'),
    images: [
      {
        url: categoriesOgImage,
        width: 1200,
        height: 630,
        alt: 'Mawjood Categories',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Categories - Mawjood',
    description: 'Browse all business categories',
    images: [categoriesOgImage],
  },
  alternates: {
    canonical: toAbsoluteUrl('/categories'),
  },
};

export default function CategoriesLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}