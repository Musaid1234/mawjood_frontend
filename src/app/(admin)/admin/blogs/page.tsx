'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { blogService, Blog } from '@/services/blog.service';
import { BlogsTable } from '@/components/admin/blogs/BlogsTable';
import { createColumns } from '@/components/admin/blogs/columns';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function BlogsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    blogId: string | null;
  }>({ open: false, blogId: null });

  // Fetch blogs
  useEffect(() => {
    fetchBlogs();
  }, [searchInput]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: 1,
        limit: 100,
      };

      if (searchInput) {
        params.search = searchInput;
      }

      const response = await blogService.getAllBlogsAdmin(params);
      setBlogs(response.data.blogs || []);
    } catch (error: any) {
      console.error('Error fetching blogs:', error);
      toast.error(error.message || 'Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (blog: Blog) => {
    router.push(`/admin/blogs/edit/${blog.id}`);
  };

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (blogId: string) => blogService.deleteBlog(blogId),
    onSuccess: () => {
      toast.success('Blog deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      setDeleteDialog({ open: false, blogId: null });
      fetchBlogs();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete blog');
    },
  });

  const handleDelete = (blogId: string) => {
    setDeleteDialog({ open: true, blogId });
  };

  const handleConfirmDelete = () => {
    if (deleteDialog.blogId) {
      deleteMutation.mutate(deleteDialog.blogId);
    }
  };

  const columns = createColumns(handleEdit, handleDelete);

  return (
    <div className="py-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blogs Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage all blog posts and articles
          </p>
        </div>
        <Button
          onClick={() => router.push('/admin/blogs/new')}
          className="bg-[#1c4233] hover:bg-[#245240] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Blog
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1c4233] rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Total Blogs</p>
          <p className="text-3xl font-bold mt-1">{blogs.length}</p>
        </div>
        <div className="bg-[#245240] rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Published</p>
          <p className="text-3xl font-bold mt-1">
            {blogs.filter((b) => b.published).length}
          </p>
        </div>
        <div className="bg-[#2d624d] rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Drafts</p>
          <p className="text-3xl font-bold mt-1">
            {blogs.filter((b) => !b.published).length}
          </p>
        </div>
      </div>

      {/* Blogs Table */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        <BlogsTable
          columns={columns}
          data={blogs}
          onSearchChange={setSearchInput}
          searchValue={searchInput}
          loading={loading}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, blogId: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the blog
              post and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}