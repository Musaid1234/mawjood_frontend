'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoryService, Category } from '@/services/category.service';
import { CategoriesTable } from '@/components/admin/categories/CategoriesTable';
import { createColumns } from '@/components/admin/categories/columns';
import CategoryDialog from '@/components/admin/categories/CategoryDialog';
import SubcategoryDialog from '@/components/admin/categories/SubcategoryDialog';
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
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogParentId, setDialogParentId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [subDialogOpen, setSubDialogOpen] = useState(false);
  const [subcategoryParent, setSubcategoryParent] = useState<Category | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    categoryId: string | null;
  }>({ open: false, categoryId: null });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await categoryService.fetchCategories(1, 100);
        let filteredCategories = response.data.categories || [];

        // Client-side filtering for search
        if (searchInput) {
          const searchLower = searchInput.toLowerCase();
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
  }, [searchInput]);

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
        if (searchInput) {
          const searchLower = searchInput.toLowerCase();
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
    setDialogParentId(null);
    setDialogOpen(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setDialogParentId(category.parentId || null);
    setDialogOpen(true);
  };

  const handleManageSubcategories = (category: Category) => {
    setSubcategoryParent(category);
    setSubDialogOpen(true);
  };

  const handleAddSubcategory = (parent: Category) => {
    setSubDialogOpen(false);
    setSelectedCategory(null);
    setDialogParentId(parent.id);
    setDialogOpen(true);
  };

  const handleEditSubcategory = (subcategory: Category) => {
    setSubDialogOpen(false);
    setSelectedCategory(subcategory);
    setDialogParentId(subcategory.parentId || null);
    setDialogOpen(true);
  };

  const handleDeleteSubcategory = (subcategoryId: string) => {
    setSubDialogOpen(false);
    handleDelete(subcategoryId);
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
    setDialogParentId(null);
    // Refetch categories when dialog closes to show updated data
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await categoryService.fetchCategories(1, 100);
        let filteredCategories = response.data.categories || [];
        if (searchInput) {
          const searchLower = searchInput.toLowerCase();
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
  };

  const columns = createColumns(handleEdit, handleDelete, handleManageSubcategories);

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
        loading={loading}
      />

      {/* Add/Edit Dialog */}
      <CategoryDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        category={selectedCategory}
        defaultParentId={dialogParentId}
      />

      <SubcategoryDialog
        open={subDialogOpen}
        onOpenChange={(open) => {
          setSubDialogOpen(open);
          if (!open) {
            // Refetch categories when dialog closes to show updated subcategories
            const fetchCategories = async () => {
              try {
                setLoading(true);
                const response = await categoryService.fetchCategories(1, 100);
                let filteredCategories = response.data.categories || [];
                if (searchInput) {
                  const searchLower = searchInput.toLowerCase();
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
          }
        }}
        category={subcategoryParent}
        onAddSubcategory={handleAddSubcategory}
        onEditSubcategory={handleEditSubcategory}
        onDeleteSubcategory={handleDeleteSubcategory}
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