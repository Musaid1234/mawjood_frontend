'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { blogService } from '@/services/blog.service';
import Image from 'next/image';
import { format } from 'date-fns';
import Link from 'next/link';

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: blog, isLoading, error } = useQuery({
    queryKey: ['blog', slug],
    queryFn: () => blogService.getBySlug(slug),
    enabled: !!slug,
  });

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

  return (
    <div className="min-h-screen bg-white">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-8">
          {blog.title}
        </h1>

        {/* Header Image */}
        {blog.image && (
          <div className="relative w-full h-96 mb-12 rounded-lg overflow-hidden">
            <Image
              src={blog.image}
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
            margin-top: 1.5rem;
            margin-bottom: 1rem;
            line-height: 1.4;
          }
          .blog-content :global(p) {
            font-size: 1.125rem !important;
            color: #374151;
            line-height: 1.75;
            margin-bottom: 1.25rem;
          }
          .blog-content :global(ul),
          .blog-content :global(ol) {
            margin: 1.5rem 0;
            padding-left: 1.5rem;
            font-size: 1.125rem;
            color: #374151;
          }
          .blog-content :global(li) {
            margin-bottom: 0.5rem;
          }
          .blog-content :global(strong) {
            font-weight: 600;
            color: #111827;
          }
          .blog-content :global(a) {
            color: #1c4233;
            text-decoration: underline;
          }
          .blog-content :global(a:hover) {
            color: #245240;
          }
        `}</style>

        {/* Author Section */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex items-start gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
              {blog.author.avatar ? (
                <Image
                  src={blog.author.avatar}
                  alt={`${blog.author.firstName} ${blog.author.lastName}`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary flex items-center justify-center text-white font-semibold text-lg">
                  {blog.author.firstName?.[0]}{blog.author.lastName?.[0]}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {blog.author.firstName} {blog.author.lastName}
              </h3>
              <p className="text-sm text-gray-600">
                {format(new Date(blog.createdAt), 'MMMM d, yyyy')}
              </p>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-12 text-center">
          <Link 
            href="/blog" 
            className="text-primary hover:underline font-medium"
          >
            ← Back to All Blogs
          </Link>
        </div>
      </article>
    </div>
  );
}
