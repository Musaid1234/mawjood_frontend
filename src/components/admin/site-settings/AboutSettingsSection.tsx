'use client';

import { AboutSettings, AboutValue, AboutHeroStat, AboutStat } from '@/services/settings.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';

interface AboutSettingsSectionProps {
  value: AboutSettings;
  onChange: (value: AboutSettings) => void;
  onSave: (value: AboutSettings) => Promise<void>;
  isSaving: boolean;
}

const createEmptyHeroStat = (): AboutHeroStat => ({
  icon: '',
  label: '',
});

const createEmptyValue = (): AboutValue => ({
  icon: '',
  title: '',
  description: '',
});

const createEmptyStat = (): AboutStat => ({
  label: '',
  value: '',
});

export function AboutSettingsSection({
  value,
  onChange,
  onSave,
  isSaving,
}: AboutSettingsSectionProps) {
  const about: AboutSettings = value ?? {};

  const updateAboutField = <K extends keyof AboutSettings>(
    field: K,
    newValue: AboutSettings[K]
  ) => {
    onChange({ ...about, [field]: newValue });
  };

  const updateHeroField = (field: 'title' | 'subtitle' | 'stats', newValue: unknown) => {
    updateAboutField('hero', {
      ...(about.hero ?? { title: '', subtitle: '', stats: [] }),
      [field]: newValue,
    });
  };

  const updateMissionField = (field: 'title' | 'description', newValue: string) => {
    updateAboutField('mission', {
      ...(about.mission ?? { title: '', description: '' }),
      [field]: newValue,
    });
  };

  const updateVisionField = (field: 'title' | 'description', newValue: string) => {
    updateAboutField('vision', {
      ...(about.vision ?? { title: '', description: '' }),
      [field]: newValue,
    });
  };

  const updateStoryField = (field: 'title' | 'paragraphs', newValue: unknown) => {
    updateAboutField('story', {
      ...(about.story ?? { title: '', paragraphs: [] }),
      [field]: newValue,
    });
  };

  const heroStats = about.hero?.stats ?? [];
  const storyParagraphs = about.story?.paragraphs ?? [];
  const values = about.values ?? [];
  const stats = about.stats ?? [];

  const handleSave = async () => {
    await onSave(about);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>About Page</CardTitle>
          <CardDescription>
            Maintain the About page hero content, mission &amp; vision statements, values, and stats.
          </CardDescription>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save About Section'}
        </Button>
      </CardHeader>

      <CardContent className="space-y-10">
        {/* Hero */}
        <section className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Hero</h3>
            <p className="text-sm text-gray-500">
              Update the hero message and stats displayed on the About page.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Hero Title</label>
              <Input
                value={about.hero?.title ?? ''}
                onChange={(event) => updateHeroField('title', event.target.value)}
                placeholder="Welcome to Mawjood"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Hero Subtitle</label>
              <Input
                value={about.hero?.subtitle ?? ''}
                onChange={(event) => updateHeroField('subtitle', event.target.value)}
                placeholder="Your trusted platform connecting businesses..."
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-600">Hero Stats</h4>
            <Button
              type="button"
              variant="outline"
              onClick={() => updateHeroField('stats', [...heroStats, createEmptyHeroStat()])}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Hero Stat
            </Button>
          </div>

          <div className="grid gap-3">
            {heroStats.length === 0 && (
              <p className="text-xs text-gray-500">
                No hero stats yet. Add badges highlighting business reach, users, etc.
              </p>
            )}

            {heroStats.map((stat, index) => (
              <div key={index} className="rounded-lg border border-gray-200 p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-gray-800">Hero Stat {index + 1}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      updateHeroField(
                        'stats',
                        heroStats.filter((_, idx) => idx !== index)
                      )
                    }
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-gray-600">
                      Icon
                    </label>
                    <Input
                      value={stat.icon ?? ''}
                      onChange={(event) => {
                        const nextStats = [...heroStats];
                        nextStats[index] = { ...nextStats[index], icon: event.target.value };
                        updateHeroField('stats', nextStats);
                      }}
                      placeholder="building"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-gray-600">
                      Label
                    </label>
                    <Input
                      value={stat.label ?? ''}
                      onChange={(event) => {
                        const nextStats = [...heroStats];
                        nextStats[index] = { ...nextStats[index], label: event.target.value };
                        updateHeroField('stats', nextStats);
                      }}
                      placeholder="1,000+ Businesses"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Mission</h3>
              <p className="text-sm text-gray-500">
                Share the mission statement for the About page.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Title</label>
              <Input
                value={about.mission?.title ?? ''}
                onChange={(event) => updateMissionField('title', event.target.value)}
                placeholder="Our Mission"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={about.mission?.description ?? ''}
                onChange={(event) => updateMissionField('description', event.target.value)}
                placeholder="Describe the mission..."
                rows={4}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#1c4233] focus:outline-none focus:ring-1 focus:ring-[#1c4233]"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Vision</h3>
              <p className="text-sm text-gray-500">
                Share the vision statement for Mawjood.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Title</label>
              <Input
                value={about.vision?.title ?? ''}
                onChange={(event) => updateVisionField('title', event.target.value)}
                placeholder="Our Vision"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={about.vision?.description ?? ''}
                onChange={(event) => updateVisionField('description', event.target.value)}
                placeholder="Describe the vision..."
                rows={4}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#1c4233] focus:outline-none focus:ring-1 focus:ring-[#1c4233]"
              />
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Our Story</h3>
              <p className="text-sm text-gray-500">
                Tell the story behind Mawjood with multiple paragraphs.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => updateStoryField('paragraphs', [...storyParagraphs, ''])}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Paragraph
            </Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Story Title</label>
              <Input
                value={about.story?.title ?? ''}
                onChange={(event) => updateStoryField('title', event.target.value)}
                placeholder="Our Story"
              />
            </div>

            <div className="grid gap-4">
              {storyParagraphs.length === 0 && (
                <p className="text-xs text-gray-500">
                  No story content yet. Add paragraphs to share how Mawjood started.
                </p>
              )}

              {storyParagraphs.map((paragraph, index) => (
                <div key={index} className="rounded-lg border border-gray-200 p-4">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-gray-800">
                      Paragraph {index + 1}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        updateStoryField(
                          'paragraphs',
                          storyParagraphs.filter((_, idx) => idx !== index)
                        )
                      }
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <textarea
                    value={paragraph ?? ''}
                    onChange={(event) => {
                      const nextParagraphs = [...storyParagraphs];
                      nextParagraphs[index] = event.target.value;
                      updateStoryField('paragraphs', nextParagraphs);
                    }}
                    placeholder="Share the journey..."
                    rows={4}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#1c4233] focus:outline-none focus:ring-1 focus:ring-[#1c4233]"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Core Values</h3>
              <p className="text-sm text-gray-500">
                Highlight the values that drive Mawjood forward.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => updateAboutField('values', [...values, createEmptyValue()])}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Value
            </Button>
          </div>

          <div className="grid gap-4">
            {values.length === 0 && (
              <p className="text-xs text-gray-500">
                No values yet. Add value statements to build trust.
              </p>
            )}

            {values.map((valueItem, index) => (
              <div key={index} className="rounded-lg border border-gray-200 p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-gray-800">
                    Value {index + 1} {valueItem.title ? `– ${valueItem.title}` : ''}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      updateAboutField(
                        'values',
                        values.filter((_, idx) => idx !== index)
                      )
                    }
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-gray-600">Icon</label>
                    <Input
                      value={valueItem.icon ?? ''}
                      onChange={(event) => {
                        const nextValues = [...values];
                        nextValues[index] = { ...nextValues[index], icon: event.target.value };
                        updateAboutField('values', nextValues);
                      }}
                      placeholder="shield"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-gray-600">Title</label>
                    <Input
                      value={valueItem.title ?? ''}
                      onChange={(event) => {
                        const nextValues = [...values];
                        nextValues[index] = { ...nextValues[index], title: event.target.value };
                        updateAboutField('values', nextValues);
                      }}
                      placeholder="Trust & Safety"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-semibold uppercase text-gray-600">
                      Description
                    </label>
                    <textarea
                      value={valueItem.description ?? ''}
                      onChange={(event) => {
                        const nextValues = [...values];
                        nextValues[index] = {
                          ...nextValues[index],
                          description: event.target.value,
                        };
                        updateAboutField('values', nextValues);
                      }}
                      placeholder="Explain what this value means for Mawjood."
                      rows={3}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#1c4233] focus:outline-none focus:ring-1 focus:ring-[#1c4233]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Key Statistics</h3>
              <p className="text-sm text-gray-500">
                Display key numbers summarizing Mawjood&apos;s impact.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => updateAboutField('stats', [...stats, createEmptyStat()])}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Stat
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {stats.length === 0 && (
              <p className="text-xs text-gray-500 md:col-span-2">
                No stats added yet. Highlight user growth, coverage, or usage metrics.
              </p>
            )}

            {stats.map((stat, index) => (
              <div key={index} className="rounded-lg border border-gray-200 p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-gray-800">Stat {index + 1}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      updateAboutField(
                        'stats',
                        stats.filter((_, idx) => idx !== index)
                      )
                    }
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-gray-600">
                    Label
                  </label>
                  <Input
                    value={stat.label ?? ''}
                    onChange={(event) => {
                      const nextStats = [...stats];
                      nextStats[index] = { ...nextStats[index], label: event.target.value };
                      updateAboutField('stats', nextStats);
                    }}
                    placeholder="Active Businesses"
                  />
                </div>

                <div className="space-y-2 mt-3">
                  <label className="text-xs font-semibold uppercase text-gray-600">
                    Value
                  </label>
                  <Input
                    value={stat.value ?? ''}
                    onChange={(event) => {
                      const nextStats = [...stats];
                      nextStats[index] = { ...nextStats[index], value: event.target.value };
                      updateAboutField('stats', nextStats);
                    }}
                    placeholder="1,000+"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </CardContent>
    </Card>
  );
}


