import { useFormikContext } from 'formik';
import { Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { categoryService } from '@/services/category.service';
import CategoryDropdown from './CategoryDropdown';
import RichTextEditor from './RichTextEditor';

export default function BasicInfoSection() {
  const { values, errors, touched, handleChange, handleBlur, setFieldValue } = useFormikContext<any>();
  const [autoSlug, setAutoSlug] = useState(true);

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.fetchCategories(),
  });
  
  useEffect(() => {
    if (autoSlug && values.name) {
      const slug = values.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFieldValue('slug', slug);
    }
  }, [values.name, autoSlug, setFieldValue]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-red-50 rounded-lg">
          <Info className="w-5 h-5 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
      </div>

      <div className="space-y-6">
        {/* Listing Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Listing Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. Elite Men's Salon"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c4233] focus:border-transparent"
          />
          {touched.name && errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name as string}</p>
          )}
        </div>

{/* Slug and Category in same row */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Slug */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      URL Slug <span className="text-red-500">*</span>
    </label>
    <div className="flex items-center gap-2">
      <input
        type="text"
        name="slug"
        value={values.slug}
        onChange={(e) => {
          setAutoSlug(false);
          handleChange(e);
        }}
        onBlur={handleBlur}
        placeholder="elite-mens-salon"
        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c4233] focus:border-transparent"
      />
      <button
        type="button"
        onClick={() => setAutoSlug(!autoSlug)}
        className={`px-4 py-3 rounded-lg font-medium transition-colors ${
          autoSlug
            ? 'bg-[#1c4233] text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Auto
      </button>
    </div>
    {touched.slug && errors.slug && (
      <p className="mt-1 text-sm text-red-600">{errors.slug as string}</p>
    )}
    <p className="mt-1 text-sm text-gray-500">
      URL: /businesses/{values.slug || 'your-business-slug'}
    </p>
  </div>

  {/* Category */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Category <span className="text-red-500">*</span>
    </label>
    <CategoryDropdown
      categories={categoriesData?.data || []}
      value={values.categoryId}
      onChange={(value) => setFieldValue('categoryId', value)}
      onBlur={() => handleBlur('categoryId')}
      error={touched.categoryId && errors.categoryId ? errors.categoryId as string : undefined}
    />
  </div>
</div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            About Listing
          </label>
          <RichTextEditor
            content={values.description || ''}
            onChange={(content) => setFieldValue('description', content)}
            placeholder="Describe your business..."
            error={touched.description && errors.description ? errors.description as string : undefined}
          />
        </div>
      </div>
    </div>
  );
}