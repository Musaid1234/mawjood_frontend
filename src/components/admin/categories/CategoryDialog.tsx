'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoryService, Category } from '@/services/category.service';
import { toast } from 'sonner';
import { Loader2, Upload, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import CategoryDropdown from '@/components/dashboard/add-listing/CategoryDropdown';

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
}

export default function CategoryDialog({ open, onOpenChange, category }: CategoryDialogProps) {
  const queryClient = useQueryClient();
  const isEditMode = !!category;

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    order: '',
    parentId: '',
  });

  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);

  // Fetch categories for parent selection
  const { data: categoriesResponse } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.fetchCategories(1, 100),
    enabled: open,
  });

  // Populate form when editing
  useEffect(() => {
    if (isEditMode && category) {
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        order: category.order?.toString() || '',
        parentId: category.parentId || '',
      });
      setIconPreview(category.icon);
    } else {
      resetForm();
    }
  }, [category, isEditMode, open]);

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      order: '',
      parentId: '',
    });
    setIconFile(null);
    setIconPreview(null);
  };

  // Auto-generate slug from name
  useEffect(() => {
    if (!isEditMode && formData.name) {
      const generatedSlug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData((prev) => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.name, isEditMode]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (formDataToSend: FormData) => categoryService.createCategory(formDataToSend),
    onSuccess: () => {
      toast.success('Category created successfully!');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create category');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, formDataToSend }: { id: string; formDataToSend: FormData }) =>
      categoryService.updateCategory(id, formDataToSend),
    onSuccess: () => {
      toast.success('Category updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update category');
    },
  });

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.slug) {
      toast.error('Name and slug are required');
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('slug', formData.slug);
    if (formData.description) formDataToSend.append('description', formData.description);
    if (formData.order) formDataToSend.append('order', formData.order);
    if (formData.parentId) formDataToSend.append('parentId', formData.parentId);
    if (iconFile) formDataToSend.append('icon', iconFile);

    if (isEditMode && category) {
      updateMutation.mutate({ id: category.id, formDataToSend });
    } else {
      createMutation.mutate(formDataToSend);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const categories = categoriesResponse?.data?.categories || [];
  const parentCategories = categories.filter((cat) => cat.id !== category?.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-6"> 
        <DialogHeader className="pb-3">
          <DialogTitle className="text-xl font-bold text-gray-900">
            {isEditMode ? 'Edit Category' : 'Add New Category'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
              Category Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Restaurants, Healthcare, Real Estate"
              required
              disabled={isLoading}
            />
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1.5">
              Slug <span className="text-red-500">*</span>
            </label>
            <Input
              id="slug"
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="e.g., restaurants, healthcare"
              required
              disabled={isLoading || !isEditMode}
              className={!isEditMode ? 'bg-gray-100' : ''}
            />
            {!isEditMode && (
              <p className="text-xs text-gray-500 mt-1">
                Slug will be auto-generated from name
              </p>
            )}
          </div>

                    {/* Order and Parent */}
                    <div className="grid grid-cols-2 gap-4">
            {/* Order */}
            <div>
              <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1.5">
                Display Order
              </label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                placeholder="0"
                min="0"
                disabled={isLoading}
                className="h-10"
              />
            </div>

            {/* Parent Category */}
            <div>
              <label htmlFor="parentId" className="block text-sm font-medium text-gray-700 mb-1.5">
                Parent Category
              </label>
              <div className="[&>div>button]:h-10 [&>div>button]:py-2">
                <CategoryDropdown
                  categories={[
                    { id: '', name: 'None (Top Level)', slug: '' },
                    ...parentCategories.map((cat) => ({
                      id: cat.id,
                      name: cat.name,
                      slug: cat.slug,
                    })),
                  ]}
                  value={formData.parentId || ''}
                  onChange={(value) => setFormData({ ...formData, parentId: value || '' })}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe this category..."
              rows={2}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c4233] focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
            />
          </div>

          {/* Icon Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Icon</label>
            <div className="mt-1 flex items-center gap-3">
              {iconPreview && (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-300">
                  <Image
                    src={iconPreview}
                    alt="Icon preview"
                    fill
                    className="object-contain p-2"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIconPreview(null);
                      setIconFile(null);
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <div className="flex-1">
                <label
                  htmlFor="icon-upload"
                  className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#1c4233] transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">
                    {iconPreview ? 'Change Icon' : 'Upload Icon'}
                  </span>
                </label>
                <Input
                  id="icon-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleIconChange}
                  className="hidden"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <DialogFooter className="gap-2 mt-4 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#1c4233] hover:bg-[#245240] text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditMode ? 'Update Category' : 'Create Category'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
