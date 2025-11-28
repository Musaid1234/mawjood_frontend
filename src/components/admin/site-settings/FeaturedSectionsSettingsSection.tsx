'use client';

import {
  FeaturedSectionCard,
  FeaturedSectionSettings,
} from '@/services/settings.service';
import { Category } from '@/services/category.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useState } from 'react';

interface FeaturedSectionsSettingsSectionProps {
  value: FeaturedSectionSettings[];
  onChange: (value: FeaturedSectionSettings[]) => void;
  onSave: (value: FeaturedSectionSettings[]) => Promise<void>;
  isSaving: boolean;
  categories: Category[];
  categoriesLoading?: boolean;
}

const createEmptySection = (): FeaturedSectionSettings => ({
  id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  title: '',
  subtitle: '',
  layout: 'grid',
  cardsPerRow: 6,
  items: [],
});

const createEmptyItem = (): FeaturedSectionCard => ({
  id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  name: '',
  image: '',
  slug: '',
});

export function FeaturedSectionsSettingsSection({
  value,
  onChange,
  onSave,
  isSaving,
  categories,
  categoriesLoading,
}: FeaturedSectionsSettingsSectionProps) {
  const sections = value ?? [];
  const [imagePreviews, setImagePreviews] = useState<Record<string, string>>({});

  const updateSection = (index: number, data: Partial<FeaturedSectionSettings>) => {
    const nextSections = [...sections];
    nextSections[index] = { ...nextSections[index], ...data };
    onChange(nextSections);
  };

  const updateSectionItem = (
    sectionIndex: number,
    itemIndex: number,
    data: Partial<FeaturedSectionCard>
  ) => {
    const nextSections = [...sections];
    const sectionItems = nextSections[sectionIndex].items ?? [];
    const nextItems = [...sectionItems];
    nextItems[itemIndex] = { ...nextItems[itemIndex], ...data };
    nextSections[sectionIndex] = { ...nextSections[sectionIndex], items: nextItems };
    onChange(nextSections);
  };

  const addSection = () => {
    onChange([...sections, createEmptySection()]);
  };

  const removeSection = (index: number) => {
    onChange(sections.filter((_, idx) => idx !== index));
  };

  const addItem = (sectionIndex: number) => {
    const nextSections = [...sections];
    const items = nextSections[sectionIndex].items ?? [];
    nextSections[sectionIndex] = {
      ...nextSections[sectionIndex],
      items: [...items, createEmptyItem()],
    };
    onChange(nextSections);
  };

  const removeItem = (sectionIndex: number, itemIndex: number) => {
    const nextSections = [...sections];
    const items = nextSections[sectionIndex].items ?? [];
    nextSections[sectionIndex] = {
      ...nextSections[sectionIndex],
      items: items.filter((_, idx) => idx !== itemIndex),
    };
    onChange(nextSections);
    const key = `${sectionIndex}-${itemIndex}`;
    const newPreviews = { ...imagePreviews };
    delete newPreviews[key];
    setImagePreviews(newPreviews);
  };

  const handleImageChange = (sectionIndex: number, itemIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const key = `${sectionIndex}-${itemIndex}`;
        setImagePreviews(prev => ({ ...prev, [key]: reader.result as string }));
        updateSectionItem(sectionIndex, itemIndex, { image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeItemImage = (sectionIndex: number, itemIndex: number) => {
    const key = `${sectionIndex}-${itemIndex}`;
    setImagePreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[key];
      return newPreviews;
    });
    updateSectionItem(sectionIndex, itemIndex, { image: '' });
  };

  const handleSave = async () => {
    await onSave(sections);
  };

  const handleCategorySelect = (
    sectionIndex: number,
    itemIndex: number,
    categoryId: string
  ) => {
    if (!categoryId) {
      updateSectionItem(sectionIndex, itemIndex, { categoryId: undefined });
      return;
    }

    const selectedCategory = categories.find((category) => category.id === categoryId);
    if (!selectedCategory) {
      updateSectionItem(sectionIndex, itemIndex, { categoryId: undefined });
      return;
    }

    updateSectionItem(sectionIndex, itemIndex, {
      categoryId,
      name: selectedCategory.name,
      slug: selectedCategory.slug,
      image: selectedCategory.image || selectedCategory.icon || '',
      id: sections[sectionIndex]?.items?.[itemIndex]?.id || selectedCategory.slug,
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Featured Sections</CardTitle>
          <CardDescription>
            Curate themed featured sections for the homepage with customizable layouts and cards.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={addSection}>
            <Plus className="mr-2 h-4 w-4" />
            Add Section
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Featured Sections'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {sections.length === 0 && (
          <p className="text-sm text-gray-500">
            No featured sections configured yet. Create sections to highlight services or categories.
          </p>
        )}

        {sections.map((section, sectionIndex) => {
          const items = section.items ?? [];
          return (
            <div
              key={section.id ?? sectionIndex}
              className={cn(
                'rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md'
              )}
            >
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h4 className="text-lg font-semibold">
                    {section.title?.length ? section.title : `Featured Section ${sectionIndex + 1}`}
                  </h4>
                  <p className="text-xs text-gray-500">
                    Customize the section card grid and featured items.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSection(sectionIndex)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Section Title</label>
                  <Input
                    value={section.title ?? ''}
                    onChange={(event) => updateSection(sectionIndex, { title: event.target.value })}
                    placeholder="Home Services"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Subtitle</label>
                  <Input
                    value={section.subtitle ?? ''}
                    onChange={(event) =>
                      updateSection(sectionIndex, { subtitle: event.target.value })
                    }
                    placeholder="Top-rated services for your home"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Layout</label>
                  <Select
                    value={section.layout ?? 'grid'}
                    onValueChange={(value) =>
                      updateSection(sectionIndex, { layout: value as 'grid' | 'carousel' })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select layout" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">Grid</SelectItem>
                      <SelectItem value="carousel">Carousel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <h5 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
                  Featured Items
                </h5>
                <Button type="button" variant="outline" onClick={() => addItem(sectionIndex)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>

              <div className="mt-4 grid gap-4">
                {items.length === 0 && (
                  <p className="text-xs text-gray-500">
                    No items added. Add cards to highlight categories within this section.
                  </p>
                )}

                {items.map((item, itemIndex) => (
                  <div
                    key={item.id ?? itemIndex}
                    className="rounded-md border border-dashed border-gray-300 p-4"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <p className="text-sm font-medium text-gray-800">
                        Item {itemIndex + 1}{' '}
                        {item.name ? (
                          <span className="text-xs text-gray-500">({item.name})</span>
                        ) : null}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(sectionIndex, itemIndex)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-gray-600">
                          Name
                        </label>
                        <Input
                          value={item.name ?? ''}
                          onChange={(event) =>
                            updateSectionItem(sectionIndex, itemIndex, {
                              name: event.target.value,
                            })
                          }
                          placeholder="Cleaning Services"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-gray-600">
                          Linked Category
                        </label>
                        <Select
                          value={item.categoryId ?? 'none'}
                          onValueChange={(value) =>
                            handleCategorySelect(sectionIndex, itemIndex, value === 'none' ? '' : value)
                          }
                          disabled={categoriesLoading}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                categoriesLoading
                                  ? 'Loading categories...'
                                  : 'Select category (optional)'
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No linked category</SelectItem>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-[11px] text-gray-500">
                          Selecting a category will auto-fill the name, slug, and image for this card.
                        </p>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-semibold uppercase text-gray-600">
                          Item Image
                        </label>
                        
                        {(imagePreviews[`${sectionIndex}-${itemIndex}`] || item.image) && (
                          <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-300">
                            <Image
                              src={imagePreviews[`${sectionIndex}-${itemIndex}`] || item.image || ''}
                              alt="Item preview"
                              fill
                              className="object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeItemImage(sectionIndex, itemIndex)}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        <label
                          htmlFor={`item-image-${sectionIndex}-${itemIndex}`}
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#1c4233] transition-colors bg-gray-50"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600">
                              <span className="font-semibold">Click to upload</span> item image
                            </p>
                            <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                          </div>
                          <input
                            id={`item-image-${sectionIndex}-${itemIndex}`}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(sectionIndex, itemIndex, e)}
                            className="hidden"
                          />
                        </label>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-gray-600">
                          Category Slug
                        </label>
                        <Input
                          value={item.slug ?? ''}
                          onChange={(event) =>
                            updateSectionItem(sectionIndex, itemIndex, {
                              slug: event.target.value,
                            })
                          }
                          placeholder="cleaning-services"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}


