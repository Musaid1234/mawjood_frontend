import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { buildOgImages, toAbsoluteUrl } from '@/config/seo.config';

export async function generateMetadata(): Promise<Metadata> {
  const { absolute: ogImage } = buildOgImages();
  const canonical = toAbsoluteUrl('/categories');

  return {
    title: 'Categories - Mawjood',
    description: 'Browse businesses by category on Mawjood.',
    openGraph: {
      title: 'Categories - Mawjood',
      description: 'Browse businesses by category on Mawjood.',
      url: canonical,
      siteName: 'Mawjood',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: 'Mawjood Categories',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Categories - Mawjood',
      description: 'Browse businesses by category on Mawjood.',
      images: [ogImage],
    },
    alternates: {
      canonical,
    },
  };
}

export default function LegacyCategoryLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}