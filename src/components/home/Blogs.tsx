'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { blogService, Blog } from '@/services/blog.service';
import { format } from 'date-fns';
import { ArrowRight } from 'lucide-react';

function stripHtml(html: string, maxLen: number = 140) {
  const text = html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  return text.length > maxLen ? `${text.slice(0, maxLen)}...` : text;
}

export default function Blogs() {
  const { data: blogs, isLoading, error } = useQuery<Blog[]>({
    queryKey: ['home-blogs'],
    queryFn: () => blogService.getBlogs(3, 1),
    staleTime: 60_000,
  });

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900">Our Blogs</h2>
          <p className="text-gray-600 mt-3">
            Insights, guides and stories from our community
          </p>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-gray-200 bg-white">
                <div className="h-48 bg-gray-200 animate-pulse" />
                <div className="p-6 space-y-4">
                  <div className="h-4 w-1/3 bg-gray-200 animate-pulse rounded" />
                  <div className="h-6 w-2/3 bg-gray-200 animate-pulse rounded" />
                  <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
                  <div className="h-4 w-5/6 bg-gray-200 animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error or empty */}
        {!isLoading && (error || !blogs || blogs.length === 0) && (
          <div className="text-center text-gray-500">
            No blogs available yet. Check back soon.
          </div>
        )}

        {/* Blogs grid */}
        {!isLoading && blogs && blogs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <article
                key={blog.id}
                className="group rounded-2xl overflow-hidden border border-gray-200 bg-white hover:shadow-lg transition-shadow h-[500px] flex flex-col"
              >
                {/* Image */}
                <div className="relative h-56 flex-shrink-0">
                  <Image
                    src={
                      blog.image ||
                      'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=1200&q=80'
                    }
                    alt={blog.title}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="text-xs text-gray-500 flex items-center gap-2 mb-2">
                    <span>{format(new Date(blog.createdAt), 'MMM d, yyyy')}</span>
                  </div>

                  <Link
                    href={`/blog/${blog.slug}`}
                    className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 mb-3"
                  >
                    {blog.title}
                  </Link>

                  <p className="text-sm text-gray-600 line-clamp-3 flex-1">
                    {stripHtml(blog.content)}
                  </p>

                  <Link
                    href={`/blog/${blog.slug}`}
                    className="mt-4 inline-flex items-center gap-2 text-primary font-medium hover:underline self-start"
                  >
                    Read More
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}