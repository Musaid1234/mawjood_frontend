'use client';

import { ReviewSettings } from '@/services/settings.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';

interface ReviewsSettingsSectionProps {
  value: ReviewSettings[];
  onChange: (value: ReviewSettings[]) => void;
  onSave: (value: ReviewSettings[]) => Promise<void>;
  isSaving: boolean;
}

const createEmptyReview = (): ReviewSettings => ({
  id: `review-${Date.now()}`,
  name: '',
  designation: '',
  rating: 5,
  comment: '',
  avatar: '',
});

export function ReviewsSettingsSection({
  value,
  onChange,
  onSave,
  isSaving,
}: ReviewsSettingsSectionProps) {
  const reviews = value ?? [];

  const updateReview = (index: number, data: Partial<ReviewSettings>) => {
    const nextReviews = [...reviews];
    nextReviews[index] = { ...nextReviews[index], ...data };
    onChange(nextReviews);
  };

  const addReview = () => {
    onChange([...reviews, createEmptyReview()]);
  };

  const removeReview = (index: number) => {
    onChange(reviews.filter((_, idx) => idx !== index));
  };

  const handleSave = async () => {
    await onSave(reviews);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>User Reviews</CardTitle>
          <CardDescription>
            Manage testimonials displayed on the homepage reviews carousel.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={addReview}>
            <Plus className="mr-2 h-4 w-4" />
            Add Review
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Reviews'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {reviews.length === 0 && (
          <p className="text-sm text-gray-500">
            No reviews added yet. Add testimonials to build trust with visitors.
          </p>
        )}

        {reviews.map((review, index) => (
          <div key={review.id ?? index} className="rounded-lg border border-gray-200 p-5 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h4 className="text-lg font-semibold">
                  {review.name || `Reviewer ${index + 1}`}
                </h4>
                <p className="text-xs text-gray-500">
                  Showcase a happy customer or partner testimonial.
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeReview(index)}
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Review ID</label>
                <Input
                  value={review.id?.toString() ?? ''}
                  onChange={(event) => updateReview(index, { id: event.target.value })}
                  placeholder="1"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Name</label>
                <Input
                  value={review.name ?? ''}
                  onChange={(event) => updateReview(index, { name: event.target.value })}
                  placeholder="Sarah"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Designation</label>
                <Input
                  value={review.designation ?? ''}
                  onChange={(event) => updateReview(index, { designation: event.target.value })}
                  placeholder="Marketing Director"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Rating (1-5)</label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={review.rating ?? 5}
                  onChange={(event) =>
                    updateReview(index, {
                      rating: Number.parseInt(event.target.value, 10) || 0,
                    })
                  }
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Avatar URL</label>
                <Input
                  value={review.avatar ?? ''}
                  onChange={(event) => updateReview(index, { avatar: event.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Comment</label>
                <textarea
                  value={review.comment ?? ''}
                  onChange={(event) => updateReview(index, { comment: event.target.value })}
                  placeholder="Share the reviewer's experience..."
                  rows={4}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#1c4233] focus:outline-none focus:ring-1 focus:ring-[#1c4233]"
                />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}


