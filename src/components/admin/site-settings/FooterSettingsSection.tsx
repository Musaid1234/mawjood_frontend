'use client';

import { FooterLink, FooterSettings, FooterSocialLink } from '@/services/settings.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';

interface FooterSettingsSectionProps {
  value: FooterSettings;
  onChange: (value: FooterSettings) => void;
  onSave: (value: FooterSettings) => Promise<void>;
  isSaving: boolean;
}

const createEmptyLink = (): FooterLink => ({
  label: '',
  url: '',
});

const createEmptySocial = (): FooterSocialLink => ({
  name: '',
  url: '',
  icon: '',
});

export function FooterSettingsSection({
  value,
  onChange,
  onSave,
  isSaving,
}: FooterSettingsSectionProps) {
  const footer: FooterSettings = value ?? {
    companyName: '',
    tagline: '',
    quickLinks: [],
    businessLinks: [],
    socialLinks: [],
  };

  const updateFooterField = (
    field: keyof FooterSettings,
    newValue: FooterSettings[typeof field]
  ) => {
    onChange({ ...footer, [field]: newValue });
  };

  const updateLinkList = (
    field: 'quickLinks' | 'businessLinks',
    index: number,
    data: Partial<FooterLink>
  ) => {
    const list = (footer[field] ?? []) as FooterLink[];
    const nextList = [...list];
    nextList[index] = { ...nextList[index], ...data };
    updateFooterField(field, nextList);
  };

  const addLink = (field: 'quickLinks' | 'businessLinks') => {
    const list = (footer[field] ?? []) as FooterLink[];
    updateFooterField(field, [...list, createEmptyLink()]);
  };

  const removeLink = (field: 'quickLinks' | 'businessLinks', index: number) => {
    const list = (footer[field] ?? []) as FooterLink[];
    updateFooterField(
      field,
      list.filter((_, idx) => idx !== index)
    );
  };

  const updateSocialLink = (index: number, data: Partial<FooterSocialLink>) => {
    const list = footer.socialLinks ?? [];
    const nextList = [...list];
    nextList[index] = { ...nextList[index], ...data };
    updateFooterField('socialLinks', nextList);
  };

  const addSocialLink = () => {
    updateFooterField('socialLinks', [...(footer.socialLinks ?? []), createEmptySocial()]);
  };

  const removeSocialLink = (index: number) => {
    updateFooterField(
      'socialLinks',
      (footer.socialLinks ?? []).filter((_, idx) => idx !== index)
    );
  };

  const handleSave = async () => {
    await onSave(footer);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Footer Content</CardTitle>
          <CardDescription>
            Manage footer branding, quick navigation links, business resources, and social icons.
          </CardDescription>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Footer'}
        </Button>
      </CardHeader>

      <CardContent className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Company Name</label>
            <Input
              value={footer.companyName ?? ''}
              onChange={(event) => updateFooterField('companyName', event.target.value)}
              placeholder="Mawjood"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Tagline</label>
            <Input
              value={footer.tagline ?? ''}
              onChange={(event) => updateFooterField('tagline', event.target.value)}
              placeholder="Connecting people to trusted local businesses..."
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
                Quick Links
              </h3>
              <p className="text-xs text-gray-500">
                Primary informational links displayed in the footer.
              </p>
            </div>
            <Button type="button" variant="outline" onClick={() => addLink('quickLinks')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Link
            </Button>
          </div>

          <div className="grid gap-3">
            {(footer.quickLinks ?? []).length === 0 && (
              <p className="text-xs text-gray-500">
                No quick links yet. Add navigation items to help users explore the site.
              </p>
            )}

            {(footer.quickLinks ?? []).map((link, index) => (
              <div key={index} className="rounded-lg border border-gray-200 p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-gray-800">
                    Quick Link {index + 1}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLink('quickLinks', index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-gray-600">Label</label>
                    <Input
                      value={link.label ?? ''}
                      onChange={(event) =>
                        updateLinkList('quickLinks', index, { label: event.target.value })
                      }
                      placeholder="About Us"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-gray-600">URL</label>
                    <Input
                      value={link.url ?? ''}
                      onChange={(event) =>
                        updateLinkList('quickLinks', index, { url: event.target.value })
                      }
                      placeholder="/about"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Business Links */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
                Business Links
              </h3>
              <p className="text-xs text-gray-500">
                Dedicated resources for business owners and partners.
              </p>
            </div>
            <Button type="button" variant="outline" onClick={() => addLink('businessLinks')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Link
            </Button>
          </div>

          <div className="grid gap-3">
            {(footer.businessLinks ?? []).length === 0 && (
              <p className="text-xs text-gray-500">
                No business links yet. Add resources like advertise, add business, etc.
              </p>
            )}

            {(footer.businessLinks ?? []).map((link, index) => (
              <div key={index} className="rounded-lg border border-gray-200 p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-gray-800">Business Link {index + 1}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLink('businessLinks', index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-gray-600">Label</label>
                    <Input
                      value={link.label ?? ''}
                      onChange={(event) =>
                        updateLinkList('businessLinks', index, { label: event.target.value })
                      }
                      placeholder="Add Business"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-gray-600">URL</label>
                    <Input
                      value={link.url ?? ''}
                      onChange={(event) =>
                        updateLinkList('businessLinks', index, { url: event.target.value })
                      }
                      placeholder="/add-business"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social Links */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
                Social Links
              </h3>
              <p className="text-xs text-gray-500">
                Configure social media links and icons shown in the footer.
              </p>
            </div>
            <Button type="button" variant="outline" onClick={addSocialLink}>
              <Plus className="mr-2 h-4 w-4" />
              Add Social Link
            </Button>
          </div>

          <div className="grid gap-3">
            {(footer.socialLinks ?? []).length === 0 && (
              <p className="text-xs text-gray-500">
                No social links set. Add social platforms to increase engagement.
              </p>
            )}

            {(footer.socialLinks ?? []).map((social, index) => (
              <div key={index} className="rounded-lg border border-gray-200 p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-gray-800">
                    Social Link {index + 1}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSocialLink(index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-gray-600">Name</label>
                    <Input
                      value={social.name ?? ''}
                      onChange={(event) =>
                        updateSocialLink(index, { name: event.target.value })
                      }
                      placeholder="Facebook"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-gray-600">Icon</label>
                    <Input
                      value={social.icon ?? ''}
                      onChange={(event) =>
                        updateSocialLink(index, { icon: event.target.value })
                      }
                      placeholder="facebook"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-1">
                    <label className="text-xs font-semibold uppercase text-gray-600">URL</label>
                    <Input
                      value={social.url ?? ''}
                      onChange={(event) =>
                        updateSocialLink(index, { url: event.target.value })
                      }
                      placeholder="https://facebook.com"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


