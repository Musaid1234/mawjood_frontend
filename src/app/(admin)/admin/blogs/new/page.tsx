'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { blogService } from '@/services/blog.service';
import { BlogForm } from '@/components/admin/blogs/BlogForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function NewBlogPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    try {
      setIsSubmitting(true);
      await blogService.createBlog(formData);
      toast.success('Blog created successfully!');
      router.push('/admin/blogs');
    } catch (error: any) {
      console.error('Error creating blog:', error);
      toast.error(error.message || 'Failed to create blog');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Blog</h1>
          <p className="text-gray-600 mt-1">
            Fill in the details below to create a new blog post
          </p>
        </div>
      </div>

      {/* Form */}
      <BlogForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}

