'use client';

import { HeroCardSettings, HeroSettings } from '@/services/settings.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeroSettingsSectionProps {
  value: HeroSettings;
  onChange: (value: HeroSettings) => void;
  onSave: (value: HeroSettings) => Promise<void>;
  isSaving: boolean;
}

const createEmptyCard = (): HeroCardSettings => ({
  id: `card-${Date.now()}`,
  title: '',
  buttonText: '',
  buttonColor: '',
  image: '',
  slug: '',
});

export function HeroSettingsSection({ value, onChange, onSave, isSaving }: HeroSettingsSectionProps) {
  const hero: HeroSettings = value ?? { title: '', subtitle: '', cards: [] };
  const cards = hero.cards ?? [];

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
                  <label className="text-sm font-medium text-gray-700">Card ID</label>
                  <Input
                    value={card.id ?? ''}
                    onChange={(event) => updateCardField(index, 'id', event.target.value)}
                    placeholder="transporters"
                  />
                </div>

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

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Image URL</label>
                  <Input
                    value={card.image ?? ''}
                    onChange={(event) => updateCardField(index, 'image', event.target.value)}
                    placeholder="https://..."
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
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


