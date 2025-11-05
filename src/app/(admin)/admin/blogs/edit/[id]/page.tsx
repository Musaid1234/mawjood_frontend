'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { blogService, Blog } from '@/services/blog.service';
import { BlogForm } from '@/components/admin/blogs/BlogForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const blogId = params.id as string;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchBlog();
  }, [blogId]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const data = await blogService.getBlogById(blogId);
      setBlog(data);
    } catch (error: any) {
      console.error('Error fetching blog:', error);
      toast.error(error.message || 'Failed to fetch blog');
      router.push('/admin/blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    try {
      setIsSubmitting(true);
      await blogService.updateBlog(blogId, formData);
      toast.success('Blog updated successfully!');
      router.push('/admin/blogs');
    } catch (error: any) {
      console.error('Error updating blog:', error);
      toast.error(error.message || 'Failed to update blog');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#1c4233]" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">Blog not found</p>
        <Button onClick={() => router.push('/admin/blogs')}>
          Go Back
        </Button>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold">Edit Blog</h1>
          <p className="text-gray-600 mt-1">
            Update the blog post details below
          </p>
        </div>
      </div>

      {/* Form */}
      <BlogForm blog={blog} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}

