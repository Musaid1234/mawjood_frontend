'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { blogService } from '@/services/blog.service';
import Image from 'next/image';
import { format } from 'date-fns';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Copy, Facebook, Linkedin, MessageCircle, Share2, Twitter } from 'lucide-react';
import { buildOgImages, toAbsoluteUrl } from '@/config/seo.config';

const stripHtml = (html?: string | null) => {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
};

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: blog, isLoading, error } = useQuery({
    queryKey: ['blog', slug],
    queryFn: () => blogService.getBySlug(slug),
    enabled: !!slug,
  });

  const [shareUrl, setShareUrl] = useState('');
  const canonicalUrl = useMemo(() => {
    if (shareUrl) return shareUrl;
    if (typeof window !== 'undefined') return window.location.href;
    if (blog?.slug) {
      return toAbsoluteUrl(`/blog/${blog.slug}`);
    }
    return '';
  }, [shareUrl, blog?.slug]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href);
    }
  }, []);

  const { absolute: ogImage, resolved: resolvedImage } = useMemo(
    () => buildOgImages(blog?.image),
    [blog?.image]
  );

  const description = useMemo(() => {
    if (!blog) return '';
    if (blog.metaDescription) return blog.metaDescription;
    const stripped = stripHtml(blog.content);
    if (stripped.length === 0) return '';
    return stripped.length > 160 ? `${stripped.slice(0, 160)}...` : stripped;
  }, [blog]);

  useEffect(() => {
    if (!blog) return;

    const existing = document.querySelector(
      `script[type="application/ld+json"][data-blog-schema="${blog.id}"]`
    );
    if (existing) {
      existing.remove();
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-blog-schema', blog.id);
    script.textContent = JSON.stringify(
      {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: blog.title,
        image: [ogImage],
        datePublished: blog.createdAt,
        dateModified: blog.updatedAt || blog.createdAt,
        description: description || undefined,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': toAbsoluteUrl(`/blog/${blog.slug}`),
        },
        author: {
          '@type': 'Person',
          name: `${blog.author.firstName} ${blog.author.lastName}`,
        },
        publisher: {
          '@type': 'Organization',
          name: 'Mawjood',
          logo: {
            '@type': 'ImageObject',
            url: ogImage,
          },
        },
      },
      (_, value) => (value === undefined ? undefined : value)
    );

    document.head.appendChild(script);

    return () => {
      const node = document.querySelector(
        `script[type="application/ld+json"][data-blog-schema="${blog.id}"]`
      );
      if (node) node.remove();
    };
  }, [blog, description, ogImage]);

  const encodedUrl = encodeURIComponent(canonicalUrl);
  const encodedTitle = encodeURIComponent(blog?.title ?? '');

  const shareActions = [
    {
      name: 'Twitter',
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      color: 'hover:bg-[#1DA1F2]/10 text-[#1DA1F2]',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'hover:bg-[#1877F2]/10 text-[#1877F2]',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: 'hover:bg-[#0A66C2]/10 text-[#0A66C2]',
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
      color: 'hover:bg-[#25D366]/10 text-[#25D366]',
    },
  ] as const;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(canonicalUrl);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Blog Not Found</h1>
          <p className="text-gray-600 mb-6">The blog post you're looking for doesn't exist.</p>
          <Link href="/blog" className="text-primary hover:underline">
            ← Back to Blogs
          </Link>
        </div>
      </div>
    );
  }

  const featuredImage = blog.image ? blog.image : resolvedImage;

  return (
    <div className="min-h-screen bg-white">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-8">
          {blog.title}
        </h1>

        {blog.categories && blog.categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {blog.categories.map((category) => (
              <Link
                key={category.id}
                href={`/blog/category/${category.slug}`}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/15 transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}

        {/* Header Image */}
        {featuredImage && (
          <div className="relative w-full h-96 mb-12 rounded-lg overflow-hidden">
            <Image
              src={featuredImage}
              alt={blog.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          </div>
        )}

        {/* Content */}
        <div
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* Share Section */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2 text-gray-700">
              <Share2 className="w-5 h-5" />
              <span className="font-semibold">Share this article</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {shareActions.map((action) => (
                <a
                  key={action.name}
                  href={action.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium transition-colors ${action.color}`}
                >
                  <action.icon className="w-4 h-4" />
                  {action.name}
                </a>
              ))}
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors text-gray-700"
              >
                <Copy className="w-4 h-4" />
                Copy link
              </button>
            </div>
          </div>
        </div>

        <style jsx>{`
          .blog-content :global(h1) {
            font-size: 2.5rem;
            font-weight: 700;
            color: #111827;
            margin-top: 2rem;
            margin-bottom: 1.5rem;
            line-height: 1.2;
          }
          .blog-content :global(h2) {
            font-size: 2rem;
            font-weight: 700;
            color: #111827;
            margin-top: 2rem;
            margin-bottom: 1rem;
            line-height: 1.3;
          }
          .blog-content :global(h3) {
            font-size: 1.5rem;
            font-weight: 600;
            color: #111827;
            margin-top: 2rem;
            margin-bottom: 1rem;
            line-height: 1.4;
          }
          .blog-content :global(p) {
            color: #4b5563;
            line-height: 1.8;
            margin-bottom: 1.5rem;
          }
          .blog-content :global(a) {
            color: #16a34a;
            text-decoration: underline;
          }
          .blog-content :global(ul),
          .blog-content :global(ol) {
            margin-left: 1.5rem;
            margin-bottom: 1.5rem;
            color: #4b5563;
          }
          .blog-content :global(blockquote) {
            border-left: 4px solid #16a34a;
            padding-left: 1.5rem;
            color: #111827;
            font-style: italic;
            margin: 2rem 0;
            background: #f9fafb;
            padding-top: 1rem;
            padding-bottom: 1rem;
          }
        `}</style>
      </article>
    </div>
  );
}
