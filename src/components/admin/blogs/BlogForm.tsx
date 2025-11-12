'use client';

import { useState, useEffect, useMemo } from 'react';
import { Blog, BlogCategory, blogService } from '@/services/blog.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import RichTextEditor from '@/components/dashboard/add-listing/RichTextEditor';
import Image from 'next/image';
import { Upload, X, Loader2, Save, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface BlogFormProps {
  blog?: Blog | null;
  onSubmit: (formData: FormData) => Promise<void>;
  isSubmitting: boolean;
}

export function BlogForm({ blog, onSubmit, isSubmitting }: BlogFormProps) {
  const slugify = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [published, setPublished] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categorySearch, setCategorySearch] = useState('');
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    slug: '',
    description: '',
  });

  useEffect(() => {
    if (blog) {
      setTitle(blog.title);
      setSlug(blog.slug);
      setContent(blog.content);
      setMetaTitle(blog.metaTitle || '');
      setMetaDescription(blog.metaDescription || '');
      setPublished(blog.published || false);
      if (blog.image) {
        setImagePreview(blog.image);
      }
      if (blog.categories && blog.categories.length > 0) {
        setSelectedCategories(blog.categories.map((category) => category.id));
      }
    }
  }, [blog]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const result = await blogService.getCategories();
        const sorted = [...result].sort((a, b) => a.name.localeCompare(b.name));
        setCategories(sorted);
      } catch (error: any) {
        console.error('Error fetching blog categories:', error);
        toast.error(error?.message || 'Failed to load blog categories');
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Auto-generate slug from title
  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!blog) {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generatedSlug);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return categories;
    return categories.filter((category) =>
      category.name.toLowerCase().includes(categorySearch.trim().toLowerCase())
    );
  }, [categories, categorySearch]);

  const toggleCategorySelection = (categoryId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      }
      return [...prev, categoryId];
    });
  };

  const resetCategoryDialogForm = () => {
    setNewCategory({
      name: '',
      slug: '',
      description: '',
    });
    setSlugManuallyEdited(false);
  };

  const handleCategoryDialogChange = (open: boolean) => {
    setIsCategoryDialogOpen(open);
    if (!open) {
      resetCategoryDialogForm();
    }
  };

  const handleNewCategoryNameChange = (value: string) => {
    setNewCategory((prev) => {
      const updatedSlug = slugManuallyEdited ? prev.slug : slugify(value);
      return {
        ...prev,
        name: value,
        slug: updatedSlug,
      };
    });
  };

  const handleNewCategorySlugChange = (value: string) => {
    setSlugManuallyEdited(true);
    setNewCategory((prev) => ({
      ...prev,
      slug: slugify(value),
    }));
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = newCategory.name.trim();
    const trimmedSlug = (newCategory.slug || slugify(newCategory.name)).trim();
    const trimmedDescription = newCategory.description.trim();

    if (!trimmedName) {
      toast.error('Category name is required');
      return;
    }

    if (!trimmedSlug) {
      toast.error('Category slug is required');
      return;
    }

    try {
      setIsCreatingCategory(true);
      const createdCategory = await blogService.createCategory({
        name: trimmedName,
        slug: trimmedSlug,
        description: trimmedDescription ? trimmedDescription : undefined,
      });

      setCategories((prev) => {
        const next = [...prev, createdCategory];
        next.sort((a, b) => a.name.localeCompare(b.name));
        return next;
      });

      setSelectedCategories((prev) =>
        prev.includes(createdCategory.id) ? prev : [...prev, createdCategory.id]
      );

      toast.success('Blog category created successfully!');
      handleCategoryDialogChange(false);
    } catch (error: any) {
      console.error('Error creating blog category:', error);
      toast.error(error?.message || 'Failed to create blog category');
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = 'Title is required';
    if (!slug.trim()) newErrors.slug = 'Slug is required';
    if (!content.trim()) newErrors.content = 'Content is required';
    if (!selectedCategories.length) newErrors.categories = 'Select at least one category';
    if (metaTitle && metaTitle.length > 60) {
      newErrors.metaTitle = 'Meta title should not exceed 60 characters';
    }
    if (metaDescription && metaDescription.length > 160) {
      newErrors.metaDescription = 'Meta description should not exceed 160 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('slug', slug.trim());
    formData.append('content', content);
    formData.append('published', published.toString());
    formData.append('categoryIds', JSON.stringify(selectedCategories));

    if (metaTitle) formData.append('metaTitle', metaTitle);
    if (metaDescription) formData.append('metaDescription', metaDescription);
    if (imageFile) formData.append('image', imageFile);

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title & Slug */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g., How to Start a Business"
              disabled={isSubmitting}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug <span className="text-red-500">*</span>
            </label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g., how-to-start-a-business"
              disabled={isSubmitting}
              className={errors.slug ? 'border-red-500' : ''}
            />
            {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
            <p className="text-xs text-gray-500 mt-1">
              URL-friendly version (lowercase, hyphens only)
            </p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Categories</h2>
            <p className="text-sm text-gray-500 mt-1">
              Select one or more categories that best describe this blog post.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => handleCategoryDialogChange(true)}
            className="bg-[#1c4233] hover:bg-[#245240] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <Input
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              placeholder="Search categories..."
              disabled={categoriesLoading}
            />
          </div>

          {selectedCategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedCategories
                .map((categoryId) => categories.find((cat) => cat.id === categoryId))
                .filter(Boolean)
                .map((category) => (
                  <span
                    key={category!.id}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1c4233]/10 text-[#1c4233] text-sm font-medium"
                  >
                    {category!.name}
                    <button
                      type="button"
                      onClick={() => toggleCategorySelection(category!.id)}
                      className="text-[#1c4233] hover:text-[#245240]"
                      aria-label={`Remove ${category!.name}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
            </div>
          )}

          <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto divide-y">
            {categoriesLoading ? (
              <div className="flex items-center justify-center py-6 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Loading categories...
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="py-6 text-center text-gray-500 text-sm">
                No categories found. Try a different search or create a new category.
              </div>
            ) : (
              filteredCategories.map((category) => {
                const isSelected = selectedCategories.includes(category.id);
                return (
                  <label
                    key={category.id}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#1c4233]/5' : 'hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 text-[#1c4233] border-gray-300 rounded focus:ring-[#1c4233]"
                      checked={isSelected}
                      onChange={() => toggleCategorySelection(category.id)}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{category.name}</p>
                      {category.description && (
                        <p className="text-xs text-gray-500 mt-1">{category.description}</p>
                      )}
                      {typeof category.blogCount === 'number' && (
                        <p className="text-xs text-gray-400 mt-1">
                          {category.blogCount} {category.blogCount === 1 ? 'post' : 'posts'}
                        </p>
                      )}
                    </div>
                  </label>
                );
              })
            )}
          </div>

          {errors.categories && (
            <p className="text-sm text-red-600">{errors.categories}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Content</h2>
        <RichTextEditor
          content={content}
          onChange={setContent}
          placeholder="Write your blog content..."
          error={errors.content}
        />
      </div>

      {/* Image Upload */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Featured Image</h2>
        
        <div className="space-y-4">
          {imagePreview && (
            <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-300">
              <Image
                src={imagePreview}
                alt="Blog preview"
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                disabled={isSubmitting}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <label
            htmlFor="image-upload"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#1c4233] transition-colors bg-gray-50"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Click to upload</span> featured image
              </p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
            </div>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              disabled={isSubmitting}
            />
          </label>
        </div>
      </div>

      {/* SEO */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">SEO Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Title
            </label>
            <Input
              id="metaTitle"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="SEO title (max 60 characters)"
              maxLength={60}
              disabled={isSubmitting}
              className={errors.metaTitle ? 'border-red-500' : ''}
            />
            {errors.metaTitle && <p className="mt-1 text-sm text-red-600">{errors.metaTitle}</p>}
            <p className="text-xs text-gray-500 mt-1">{metaTitle.length}/60 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Description
            </label>
            <textarea
              id="metaDescription"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="SEO description (max 160 characters)"
              maxLength={160}
              rows={3}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1c4233] focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed ${
                errors.metaDescription ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.metaDescription && <p className="mt-1 text-sm text-red-600">{errors.metaDescription}</p>}
            <p className="text-xs text-gray-500 mt-1">{metaDescription.length}/160 characters</p>
          </div>
        </div>
      </div>

      {/* Publish Status & Submit */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="published"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              disabled={isSubmitting}
              className="w-4 h-4 text-[#1c4233] border-gray-300 rounded focus:ring-[#1c4233]"
            />
            <label htmlFor="published" className="text-sm font-medium text-gray-700 cursor-pointer">
              Publish immediately
            </label>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#1c4233] hover:bg-[#245240] text-white px-8"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                {blog ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                {blog ? 'Update Blog' : 'Create Blog'}
              </>
            )}
          </Button>
        </div>
      </div>

      <Dialog open={isCategoryDialogOpen} onOpenChange={handleCategoryDialogChange}>
        <DialogContent className="sm:max-w-lg p-6">
          <form onSubmit={handleCreateCategory} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Add Blog Category
              </DialogTitle>
            </DialogHeader>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={newCategory.name}
                onChange={(e) => handleNewCategoryNameChange(e.target.value)}
                placeholder="e.g., Entrepreneurship, Marketing"
                required
                disabled={isCreatingCategory}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug <span className="text-red-500">*</span>
              </label>
              <Input
                value={newCategory.slug}
                onChange={(e) => handleNewCategorySlugChange(e.target.value)}
                placeholder="e.g., entrepreneurship, marketing"
                required
                disabled={isCreatingCategory}
              />
              <p className="text-xs text-gray-500 mt-1">
                Used in the URL. Lowercase letters, numbers, and hyphens only.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={newCategory.description}
                onChange={(e) => setNewCategory((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Optional short description for this category"
                rows={3}
                disabled={isCreatingCategory}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c4233] focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleCategoryDialogChange(false)}
                disabled={isCreatingCategory}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreatingCategory}
                className="bg-[#1c4233] hover:bg-[#245240] text-white"
              >
                {isCreatingCategory ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  'Create Category'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </form>
  );
}

