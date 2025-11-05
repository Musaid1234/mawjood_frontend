'use client';

import { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoryService, Category } from '@/services/category.service';
import { CategoriesTable } from '@/components/admin/categories/CategoriesTable';
import { createColumns } from '@/components/admin/categories/columns';
import CategoryDialog from '@/components/admin/categories/CategoryDialog';
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

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    categoryId: string | null;
  }>({ open: false, categoryId: null });

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Debounce search input
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchInput]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await categoryService.fetchCategories(1, 100);
        let filteredCategories = response.data.categories || [];

        // Client-side filtering for search
        if (debouncedSearch) {
          const searchLower = debouncedSearch.toLowerCase();
          filteredCategories = filteredCategories.filter(
            (cat) =>
              cat.name.toLowerCase().includes(searchLower) ||
              cat.slug.toLowerCase().includes(searchLower) ||
              (cat.description && cat.description.toLowerCase().includes(searchLower))
          );
        }

        setCategories(filteredCategories);
      } catch (error: any) {
        console.error('Error fetching categories:', error);
        toast.error(error.message || 'Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [debouncedSearch]);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (categoryId: string) => categoryService.deleteCategory(categoryId),
    onSuccess: () => {
      toast.success('Category deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setDeleteDialog({ open: false, categoryId: null });
      // Refetch categories
      const fetchCategories = async () => {
        const response = await categoryService.fetchCategories(1, 100);
        let filteredCategories = response.data.categories || [];
        if (debouncedSearch) {
          const searchLower = debouncedSearch.toLowerCase();
          filteredCategories = filteredCategories.filter(
            (cat) =>
              cat.name.toLowerCase().includes(searchLower) ||
              cat.slug.toLowerCase().includes(searchLower) ||
              (cat.description && cat.description.toLowerCase().includes(searchLower))
          );
        }
        setCategories(filteredCategories);
      };
      fetchCategories();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete category');
    },
  });

  const handleAdd = () => {
    setSelectedCategory(null);
    setDialogOpen(true);
  };

  const handleEdit = (category: any) => {
    setSelectedCategory(category as Category);
    setDialogOpen(true);
  };

  const handleDelete = (categoryId: string) => {
    setDeleteDialog({ open: true, categoryId });
  };

  const handleConfirmDelete = () => {
    if (deleteDialog.categoryId) {
      deleteMutation.mutate(deleteDialog.categoryId);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedCategory(null);
  };

  const columns = createColumns(handleEdit, handleDelete);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1c4233]" />
      </div>
    );
  }

  return (
    <div className="py-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Categories Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage all business categories and subcategories
          </p>
        </div>
        <Button onClick={handleAdd} className="bg-[#1c4233] hover:bg-[#245240] text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Table */}
      <CategoriesTable
        columns={columns}
        data={categories}
        onSearchChange={setSearchInput}
        searchValue={searchInput}
      />

      {/* Add/Edit Dialog */}
      <CategoryDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        category={selectedCategory}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, categoryId: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the category
              and remove all associated data.
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