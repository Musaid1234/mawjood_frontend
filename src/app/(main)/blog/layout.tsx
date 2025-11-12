import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { buildOgImages, toAbsoluteUrl } from '@/config/seo.config';

const { absolute: blogOgImage } = buildOgImages();

export const metadata: Metadata = {
  title: 'Mawjood Blog - Insights, Guides & Stories',
  description: 'Discover the latest insights, guides, and community stories on the Mawjood blog. Stay updated with tips and news from local businesses across Saudi Arabia.',
  openGraph: {
    title: 'Mawjood Blog',
    description: 'Insights, guides and stories from the Mawjood community.',
    url: toAbsoluteUrl('/blog'),
    siteName: 'Mawjood',
    images: [
      {
        url: blogOgImage,
        width: 1200,
        height: 630,
        alt: 'Mawjood Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mawjood Blog',
    description: 'Insights, guides and stories from the Mawjood community.',
    images: [blogOgImage],
  },
  alternates: {
    canonical: toAbsoluteUrl('/blog'),
  },
};

export default function BlogLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
