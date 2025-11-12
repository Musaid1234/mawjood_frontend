'use client';

import { DownloadBannerSettings } from '@/services/settings.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';

interface DownloadBannerSettingsSectionProps {
  value: DownloadBannerSettings;
  onChange: (value: DownloadBannerSettings) => void;
  onSave: (value: DownloadBannerSettings) => Promise<void>;
  isSaving: boolean;
}

const createEmptyMetric = () => ({
  label: '',
  value: '',
});

export function DownloadBannerSettingsSection({
  value,
  onChange,
  onSave,
  isSaving,
}: DownloadBannerSettingsSectionProps) {
  const banner: DownloadBannerSettings = value ?? {
    title: '',
    subtitle: '',
    appStoreUrl: '',
    playStoreUrl: '',
    metrics: [],
  };
  const metrics = banner.metrics ?? [];

  const updateBannerField = (
    field: keyof DownloadBannerSettings,
    newValue: DownloadBannerSettings[typeof field]
  ) => {
    onChange({ ...banner, [field]: newValue });
  };

  const updateMetric = (index: number, data: Partial<{ label: string; value: string }>) => {
    const nextMetrics = [...metrics];
    nextMetrics[index] = { ...nextMetrics[index], ...data };
    updateBannerField('metrics', nextMetrics);
  };

  const addMetric = () => {
    updateBannerField('metrics', [...metrics, createEmptyMetric()]);
  };

  const removeMetric = (index: number) => {
    updateBannerField(
      'metrics',
      metrics.filter((_, idx) => idx !== index)
    );
  };

  const handleSave = async () => {
    await onSave({ ...banner, metrics });
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Download Banner</CardTitle>
          <CardDescription>
            Manage the app download banner content and key metrics displayed on the homepage.
          </CardDescription>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Download Banner'}
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Title</label>
            <Input
              value={banner.title ?? ''}
              onChange={(event) => updateBannerField('title', event.target.value)}
              placeholder="Download Mawjood App"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Subtitle</label>
            <Input
              value={banner.subtitle ?? ''}
              onChange={(event) => updateBannerField('subtitle', event.target.value)}
              placeholder="Explore trusted local businesses anytime, anywhere."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">App Store URL</label>
            <Input
              value={banner.appStoreUrl ?? ''}
              onChange={(event) => updateBannerField('appStoreUrl', event.target.value)}
              placeholder="https://apps.apple.com/..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Play Store URL</label>
            <Input
              value={banner.playStoreUrl ?? ''}
              onChange={(event) => updateBannerField('playStoreUrl', event.target.value)}
              placeholder="https://play.google.com/..."
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
            Highlight Metrics
          </h3>
          <Button type="button" variant="outline" onClick={addMetric}>
            <Plus className="mr-2 h-4 w-4" />
            Add Metric
          </Button>
        </div>

        <div className="grid gap-4">
          {metrics.length === 0 && (
            <p className="text-sm text-gray-500">
              Highlight key numbers (users, ratings, coverage) to build credibility.
            </p>
          )}

          {metrics.map((metric, index) => (
            <div key={index} className="rounded-lg border border-gray-200 p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-gray-800">Metric {index + 1}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMetric(index)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-gray-600">
                    Label
                  </label>
                  <Input
                    value={metric.label ?? ''}
                    onChange={(event) =>
                      updateMetric(index, {
                        label: event.target.value,
                      })
                    }
                    placeholder="Active Users"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-gray-600">
                    Value
                  </label>
                  <Input
                    value={metric.value ?? ''}
                    onChange={(event) =>
                      updateMetric(index, {
                        value: event.target.value,
                      })
                    }
                    placeholder="10K+"
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


