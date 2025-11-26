'use client';

import { Category } from '@/services/category.service';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, Hash, Pencil, Trash2 } from 'lucide-react';

interface SubcategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  onAddSubcategory: (parent: Category) => void;
  onEditSubcategory: (subcategory: Category) => void;
  onDeleteSubcategory: (subcategoryId: string) => void;
}

export default function SubcategoryDialog({
  open,
  onOpenChange,
  category,
  onAddSubcategory,
  onEditSubcategory,
  onDeleteSubcategory,
}: SubcategoryDialogProps) {
  const subcategories = (category?.subcategories || [])
    .slice()
    .sort((a, b) => a.order - b.order);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {category ? `Subcategories of ${category.name}` : 'Subcategories'}
          </DialogTitle>
          <DialogDescription>
            Manage the order and details of nested categories.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end">
          <Button
            className="bg-[#1c4233] hover:bg-[#245240]"
            onClick={() => category && onAddSubcategory(category)}
            disabled={!category}
          >
            Add Subcategory
          </Button>
        </div>

        <div className="mt-4 max-h-[60vh] overflow-y-auto space-y-3">
          {subcategories.length === 0 ? (
            <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
              No subcategories found for this category.
            </div>
          ) : (
            subcategories.map((sub) => (
              <div
                key={sub.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-gray-200 rounded-lg p-4"
              >
                <div>
                  <div className="font-semibold text-gray-900">{sub.name}</div>
                  <div className="text-sm text-gray-500">/{sub.slug}</div>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                    <span className="inline-flex items-center gap-1">
                      <Hash className="w-4 h-4 text-gray-400" />
                      Order {sub.order}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => onEditSubcategory(sub)}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => onDeleteSubcategory(sub.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}


