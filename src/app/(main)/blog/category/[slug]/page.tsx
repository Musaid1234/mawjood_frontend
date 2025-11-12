'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { blogService, BlogCategory } from '@/services/blog.service';
import { BlogsListing } from '../../page';
import { Loader2 } from 'lucide-react';

export default function BlogCategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  const {
    data: category,
    isLoading,
    error,
  } = useQuery<BlogCategory>({
    queryKey: ['blog-category', slug],
    queryFn: () => blogService.getCategoryBySlug(slug),
    enabled: Boolean(slug),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center bg-white rounded-2xl shadow-sm border border-gray-200 p-10 max-w-lg">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Category not found</h1>
          <p className="text-gray-600">
            The category you&apos;re looking for doesn&apos;t exist or has been removed. Please explore other blog categories.
          </p>
        </div>
      </div>
    );
  }

  return <BlogsListing initialCategorySlug={category.slug} categoryInfo={category} />;
}

