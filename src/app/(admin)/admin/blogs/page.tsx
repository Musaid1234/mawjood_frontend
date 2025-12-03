'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { blogService, Blog, BlogCategory } from '@/services/blog.service';
import { BlogsTable } from '@/components/admin/blogs/BlogsTable';
import { createColumns } from '@/components/admin/blogs/columns';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    blogId: string | null;
  }>({ open: false, blogId: null });

  // Fetch blogs
  useEffect(() => {
    fetchBlogs();
  }, [searchInput]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await blogService.getCategories();
        setCategories(result);
      } catch (error: any) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

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

  // Filter blogs based on status, date, and category
  const filteredBlogs = useMemo(() => {
    let filtered = [...blogs];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((blog) => {
        const blogStatus = (blog as any).status || (blog.published ? 'PUBLISHED' : 'DRAFT');
        return blogStatus === statusFilter;
      });
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter((blog) => {
        const blogDate = new Date(blog.createdAt);
        switch (dateFilter) {
          case 'today':
            return blogDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return blogDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return blogDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((blog) => {
        return blog.categories?.some((cat) => cat.id === categoryFilter);
      });
    }

    return filtered;
  }, [blogs, statusFilter, dateFilter, categoryFilter]);

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

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-1 w-8 bg-[#1c4233] rounded-full"></div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Status
            </label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full h-11 text-base border-2 border-gray-300 dark:border-gray-700 hover:border-[#1c4233] dark:hover:border-[#1c4233] transition-colors">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Date Range
            </label>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full h-11 text-base border-2 border-gray-300 dark:border-gray-700 hover:border-[#1c4233] dark:hover:border-[#1c4233] transition-colors">
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Category
            </label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full h-11 text-base border-2 border-gray-300 dark:border-gray-700 hover:border-[#1c4233] dark:hover:border-[#1c4233] transition-colors">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Blogs Table */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        <BlogsTable
          columns={columns}
          data={filteredBlogs}
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