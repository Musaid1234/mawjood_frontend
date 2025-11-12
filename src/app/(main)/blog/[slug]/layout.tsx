import { Metadata } from 'next';
import { ReactNode } from 'react';
import { blogService } from '@/services/blog.service';
import { buildOgImages, toAbsoluteUrl } from '@/config/seo.config';

interface Props {
  params: Promise<{ slug: string }>;
  children: ReactNode;
}

const buildDescription = (blog: Awaited<ReturnType<typeof blogService.getBySlug>>) => {
  if (blog.metaDescription) {
    return blog.metaDescription;
  }

  if (blog.content) {
    const strippedContent = blog.content.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (strippedContent.length > 0) {
      return (
        strippedContent.length > 160
          ? `${strippedContent.substring(0, 160)}...`
          : strippedContent
      );
    }
  }

  return `Read ${blog.title} on Mawjood. ${blog.author.firstName} ${blog.author.lastName}`;
};

export async function generateMetadata({ params }: Omit<Props, 'children'>): Promise<Metadata> {
  const { slug } = await params;
  try {
    const blog = await blogService.getBySlug(slug);

    const title = blog.metaTitle || `${blog.title} | Mawjood Blog`;
    const description = buildDescription(blog);
    const keywords = blog.tags && Array.isArray(blog.tags)
      ? blog.tags.join(', ')
      : `${blog.title}, blog, Mawjood, ${blog.author.firstName} ${blog.author.lastName}`;

    const { absolute } = buildOgImages(blog.image);
    const canonical = toAbsoluteUrl(`/blog/${blog.slug}`);

    return {
      title,
      description,
      keywords,
      openGraph: {
        title,
        description,
        images: [
          {
            url: absolute,
            width: 1200,
            height: 630,
            alt: blog.title,
          },
        ],
        type: 'article',
        locale: 'en_US',
        siteName: 'Mawjood',
        url: canonical,
        publishedTime: blog.createdAt,
        authors: [`${blog.author.firstName} ${blog.author.lastName}`],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [absolute],
      },
      alternates: {
        canonical,
      },
      other: {
        'og:image:secure_url': absolute,
        'og:image:type': 'image/png',
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch (error) {
    return {
      title: 'Blog Not Found | Mawjood',
      description: 'The blog post you are looking for could not be found.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

export default async function BlogLayout({ children, params }: Props) {
  await params;
  return <>{children}</>;
}