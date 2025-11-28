'use client';

import { HeroCardSettings, HeroSettings } from '@/services/settings.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useState } from 'react';

interface HeroSettingsSectionProps {
  value: HeroSettings;
  onChange: (value: HeroSettings) => void;
  onSave: (value: HeroSettings) => Promise<void>;
  isSaving: boolean;
}

const createEmptyCard = (): HeroCardSettings => ({
  id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  title: '',
  buttonText: '',
  buttonColor: '',
  image: '',
  slug: '',
});

export function HeroSettingsSection({ value, onChange, onSave, isSaving }: HeroSettingsSectionProps) {
  const hero: HeroSettings = value ?? { title: '', subtitle: '', cards: [] };
  const cards = hero.cards ?? [];
  const [imagePreviews, setImagePreviews] = useState<Record<number, string>>({});

  const updateHeroField = (field: keyof HeroSettings, newValue: HeroSettings[typeof field]) => {
    onChange({ ...hero, [field]: newValue });
  };

  const updateCardField = (
    index: number,
    field: keyof HeroCardSettings,
    newValue: HeroCardSettings[typeof field]
  ) => {
    const nextCards = [...cards];
    nextCards[index] = { ...nextCards[index], [field]: newValue };
    onChange({ ...hero, cards: nextCards });
  };

  const addCard = () => {
    onChange({ ...hero, cards: [...cards, createEmptyCard()] });
  };

  const removeCard = (index: number) => {
    const nextCards = cards.filter((_, idx) => idx !== index);
    onChange({ ...hero, cards: nextCards });
    const newPreviews = { ...imagePreviews };
    delete newPreviews[index];
    setImagePreviews(newPreviews);
  };

  const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => ({ ...prev, [index]: reader.result as string }));
        updateCardField(index, 'image', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    setImagePreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[index];
      return newPreviews;
    });
    updateCardField(index, 'image', '');
  };

  const handleSave = async () => {
    await onSave({ ...hero, cards });
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Home Hero Section</CardTitle>
          <CardDescription>
            Configure the main hero heading, messaging, and highlight cards shown on the homepage.
          </CardDescription>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Hero Section'}
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Hero Title</label>
            <Input
              value={hero.title ?? ''}
              onChange={(event) => updateHeroField('title', event.target.value)}
              placeholder="Discover & Connect Locally"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Hero Subtitle</label>
            <Input
              value={hero.subtitle ?? ''}
              onChange={(event) => updateHeroField('subtitle', event.target.value)}
              placeholder="Find trusted businesses, services, and experiences across Saudi Arabia."
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Hero Cards</h3>
          <Button type="button" variant="outline" onClick={addCard}>
            <Plus className="mr-2 h-4 w-4" />
            Add Card
          </Button>
        </div>

        <div className="grid gap-4">
          {cards.length === 0 && (
            <p className="text-sm text-gray-500">
              No cards configured yet. Add highlight cards to showcase key categories.
            </p>
          )}

          {cards.map((card, index) => (
            <div
              key={card.id ?? index}
              className={cn(
                'rounded-lg border border-gray-200 p-4 shadow-sm transition hover:shadow-md',
                'bg-white'
              )}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-base font-semibold">Card {index + 1}</h4>
                  <p className="text-xs text-gray-500">
                    Configure the category highlight displayed in the hero carousel.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCard(index)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Title</label>
                  <Input
                    value={card.title ?? ''}
                    onChange={(event) => updateCardField(index, 'title', event.target.value)}
                    placeholder="Packers & Movers"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Button Text</label>
                  <Input
                    value={card.buttonText ?? ''}
                    onChange={(event) => updateCardField(index, 'buttonText', event.target.value)}
                    placeholder="Get Best Deal"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Button Color Classes</label>
                  <Input
                    value={card.buttonColor ?? ''}
                    onChange={(event) => updateCardField(index, 'buttonColor', event.target.value)}
                    placeholder="bg-orange-500 hover:bg-orange-600"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Category Slug</label>
                  <Input
                    value={card.slug ?? ''}
                    onChange={(event) => updateCardField(index, 'slug', event.target.value)}
                    placeholder="real-estate"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Card Image</label>
                  
                  {(imagePreviews[index] || card.image) && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-300">
                      <Image
                        src={imagePreviews[index] || card.image || ''}
                        alt="Card preview"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <label
                    htmlFor={`card-image-${index}`}
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#1c4233] transition-colors bg-gray-50"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Click to upload</span> card image
                      </p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                    </div>
                    <input
                      id={`card-image-${index}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(index, e)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


