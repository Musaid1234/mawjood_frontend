import { Metadata } from 'next';
import { ReactNode } from 'react';
import { blogService } from '@/services/blog.service';

interface Props {
  params: Promise<{ slug: string }>;
  children: ReactNode;
}

export async function generateMetadata({ params }: Omit<Props, 'children'>): Promise<Metadata> {
  const { slug } = await params;
  try {
    const blog = await blogService.getBySlug(slug);

    const title = blog.metaTitle || `${blog.title} | Mawjood Blog`;
    
    let description = blog.metaDescription;
    if (!description && blog.content) {
      const strippedContent = blog.content.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      description = strippedContent.length > 0 
        ? strippedContent.substring(0, 160) + (strippedContent.length > 160 ? '...' : '')
        : `Read ${blog.title} on Mawjood. ${blog.author.firstName} ${blog.author.lastName}`;
    }
    if (!description) {
      description = `Read ${blog.title} on Mawjood. ${blog.author.firstName} ${blog.author.lastName}`;
    }
    
    // Convert tags array to keywords string
    const keywords = blog.tags && Array.isArray(blog.tags) 
      ? blog.tags.join(', ')
      : `${blog.title}, blog, Mawjood, ${blog.author.firstName} ${blog.author.lastName}`;

    const image = blog.image || '/og-default.jpg';

    return {
      title,
      description,
      keywords,
      
      openGraph: {
        title,
        description,
        images: [{
          url: image,
          width: 1200,
          height: 630,
          alt: blog.title,
        }],
        type: 'article',
        locale: 'en_US',
        siteName: 'Mawjood',
        publishedTime: blog.createdAt,
        authors: [`${blog.author.firstName} ${blog.author.lastName}`],
      },

      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
      },

      alternates: {
        canonical: `/blog/${blog.slug}`,
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