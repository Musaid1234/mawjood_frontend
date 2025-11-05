'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { blogService, Blog } from '@/services/blog.service';
import BlogCard from '@/components/blog/BlogCard';

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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>

            {/* View All Link */}
            <div className="text-center mt-12">
              <Link
                href="/blog"
                className="inline-block bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
              >
                View All Blogs
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}