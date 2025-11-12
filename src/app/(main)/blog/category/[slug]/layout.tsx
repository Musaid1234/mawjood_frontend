import { Metadata } from 'next';
import { ReactNode } from 'react';
import { blogService } from '@/services/blog.service';
import { buildOgImages, toAbsoluteUrl } from '@/config/seo.config';

interface Props {
  params: Promise<{ slug: string }>;
  children: ReactNode;
}

export async function generateMetadata({ params }: Omit<Props, 'children'>): Promise<Metadata> {
  const { slug } = await params;

  try {
    const category = await blogService.getCategoryBySlug(slug);
    const title = `${category.name} Articles | Mawjood Blog`;
    const description = category.description || `Explore the latest ${category.name.toLowerCase()} articles, guides, and updates on Mawjood.`;
    const { absolute: ogImage } = buildOgImages();
    const canonical = toAbsoluteUrl(`/blog/category/${category.slug}`);

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: canonical,
        siteName: 'Mawjood',
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: `${category.name} articles`,
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
  } catch (error) {
    return {
      title: 'Blog Category | Mawjood',
      description: 'Explore the latest articles and guides on Mawjood.',
    };
  }
}

export default async function BlogCategoryLayout({ children, params }: Props) {
  await params;
  return <>{children}</>;
}
