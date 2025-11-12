'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, RefreshCw, RotateCcw } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { settingsService, SiteSettings } from '@/services/settings.service';
import { Button } from '@/components/ui/button';
import { HeroSettingsSection } from '@/components/admin/site-settings/HeroSettingsSection';
import { NavbarSettingsSection } from '@/components/admin/site-settings/NavbarSettingsSection';
import { FeaturedSectionsSettingsSection } from '@/components/admin/site-settings/FeaturedSectionsSettingsSection';
import { ReviewsSettingsSection } from '@/components/admin/site-settings/ReviewsSettingsSection';
import { DownloadBannerSettingsSection } from '@/components/admin/site-settings/DownloadBannerSettingsSection';
import { FooterSettingsSection } from '@/components/admin/site-settings/FooterSettingsSection';
import { AboutSettingsSection } from '@/components/admin/site-settings/AboutSettingsSection';
import { ContactSettingsSection } from '@/components/admin/site-settings/ContactSettingsSection';

const PAGE_TITLE = 'Site Experience Settings';
const PAGE_DESCRIPTION =
  'Manage the core content blocks that power the Mawjood marketing pages. Update hero content, featured sections, reviews, footer links, and more—all in one place.';

export default function SiteSettingsPage() {
  const { data, isLoading, isFetching, refetch } = useSiteSettings();
  const queryClient = useQueryClient();

  const [formState, setFormState] = useState<SiteSettings | null>(null);
  const [savingSection, setSavingSection] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setFormState(data);
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<SiteSettings>) =>
      settingsService.updateSiteSettings(payload),
  });

  const handlePartialSave = async (sectionKey: string, payload: Partial<SiteSettings>) => {
    if (!formState) return;
    try {
      setSavingSection(sectionKey);
      const updated = await updateMutation.mutateAsync(payload);
      setFormState(updated);
      queryClient.setQueryData(['site-settings'], updated);
      toast.success('Site settings updated successfully');
    } catch (error: any) {
      console.error('Save site settings error:', error);
      toast.error(error?.message || 'Failed to update site settings');
    } finally {
      setSavingSection((current) => (current === sectionKey ? null : current));
    }
  };

  const handleReset = () => {
    if (data) {
      setFormState(data);
      toast.success('Reverted changes');
    }
  };

  const isSavingSection = (key: string) => savingSection === key && updateMutation.isPending;

  const heroValue = useMemo(
    () => formState?.hero ?? { title: '', subtitle: '', cards: [] },
    [formState?.hero]
  );

  const navbarValue = useMemo(
    () => formState?.navbar ?? { logoUrl: '', brandName: '', tagline: '' },
    [formState?.navbar]
  );

  if (isLoading || !formState) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-3">
        <Loader2 className="h-10 w-10 animate-spin text-[#1c4233]" />
        <p className="text-sm text-gray-500">Loading site settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{PAGE_TITLE}</h1>
          <p className="mt-2 max-w-3xl text-sm text-gray-600">{PAGE_DESCRIPTION}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isFetching}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset Changes
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={isFetching ? 'mr-2 h-4 w-4 animate-spin' : 'mr-2 h-4 w-4'} />
            Refresh
          </Button>
        </div>
      </header>

      <div className="space-y-6">
        <HeroSettingsSection
          value={heroValue}
          onChange={(hero) =>
            setFormState((prev) => (prev ? { ...prev, hero } : prev))
          }
          onSave={(hero) => handlePartialSave('hero', { hero })}
          isSaving={isSavingSection('hero')}
        />

        <NavbarSettingsSection
          value={navbarValue}
          onChange={(navbar) =>
            setFormState((prev) => (prev ? { ...prev, navbar } : prev))
          }
          onSave={(navbar) => handlePartialSave('navbar', { navbar })}
          isSaving={isSavingSection('navbar')}
        />

        <FeaturedSectionsSettingsSection
          value={formState.featuredSections ?? []}
          onChange={(featuredSections) =>
            setFormState((prev) => (prev ? { ...prev, featuredSections } : prev))
          }
          onSave={(featuredSections) =>
            handlePartialSave('featuredSections', { featuredSections })
          }
          isSaving={isSavingSection('featuredSections')}
        />

        <ReviewsSettingsSection
          value={formState.reviews ?? []}
          onChange={(reviews) =>
            setFormState((prev) => (prev ? { ...prev, reviews } : prev))
          }
          onSave={(reviews) => handlePartialSave('reviews', { reviews })}
          isSaving={isSavingSection('reviews')}
        />

        <DownloadBannerSettingsSection
          value={formState.downloadBanner ?? {}}
          onChange={(downloadBanner) =>
            setFormState((prev) => (prev ? { ...prev, downloadBanner } : prev))
          }
          onSave={(downloadBanner) =>
            handlePartialSave('downloadBanner', { downloadBanner })
          }
          isSaving={isSavingSection('downloadBanner')}
        />

        <FooterSettingsSection
          value={formState.footer ?? {}}
          onChange={(footer) =>
            setFormState((prev) => (prev ? { ...prev, footer } : prev))
          }
          onSave={(footer) => handlePartialSave('footer', { footer })}
          isSaving={isSavingSection('footer')}
        />

        <AboutSettingsSection
          value={formState.about ?? {}}
          onChange={(about) =>
            setFormState((prev) => (prev ? { ...prev, about } : prev))
          }
          onSave={(about) => handlePartialSave('about', { about })}
          isSaving={isSavingSection('about')}
        />

        <ContactSettingsSection
          value={formState.contact ?? {}}
          onChange={(contact) =>
            setFormState((prev) => (prev ? { ...prev, contact } : prev))
          }
          onSave={(contact) => handlePartialSave('contact', { contact })}
          isSaving={isSavingSection('contact')}
        />
      </div>
    </div>
  );
}


