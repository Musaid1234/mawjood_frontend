import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { buildOgImages, toAbsoluteUrl } from '@/config/seo.config';
import { categoryService } from '@/services/category.service';

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const response = await categoryService.fetchCategoryBySlug(slug);
    const categoryData = response?.data;

    if (!categoryData) {
      return {
        title: 'Category Not Found | Mawjood',
        description: 'The category you are looking for could not be found.',
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    const categoryName = categoryData.name;
    const title = `${categoryName} Businesses Worldwide | Mawjood`;
    const description =
      categoryData.description ||
      `Browse verified ${categoryName.toLowerCase()} businesses from across the globe on Mawjood.`;
    const canonical = toAbsoluteUrl(`/category/${slug}`);
    const { absolute: ogImage } = buildOgImages(categoryData.image || categoryData.icon);

    return {
      title,
      description,
      keywords: [
        `${categoryName} businesses`,
        `global ${categoryName.toLowerCase()} directory`,
        `${categoryName.toLowerCase()} listings`,
        `best ${categoryName.toLowerCase()} companies`,
      ].join(', '),
      openGraph: {
        title,
        description,
        type: 'website',
        url: canonical,
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: `${categoryName} businesses on Mawjood`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImage],
      },
      alternates: {
        canonical,
      },
    };
  } catch {
    return {
      title: 'Category Not Found | Mawjood',
      description: 'The category you are looking for could not be found.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

export default function CategoryLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}


