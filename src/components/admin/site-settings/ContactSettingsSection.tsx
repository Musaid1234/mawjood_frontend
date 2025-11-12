'use client';

import { ContactSettings, FooterSocialLink } from '@/services/settings.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';

interface ContactSettingsSectionProps {
  value: ContactSettings;
  onChange: (value: ContactSettings) => void;
  onSave: (value: ContactSettings) => Promise<void>;
  isSaving: boolean;
}

const createEmptySocial = (): FooterSocialLink => ({
  name: '',
  url: '',
});

export function ContactSettingsSection({
  value,
  onChange,
  onSave,
  isSaving,
}: ContactSettingsSectionProps) {
  const contact: ContactSettings = value ?? {
    emails: [],
    phones: [],
    socialLinks: [],
    location: {
      address: '',
      latitude: undefined,
      longitude: undefined,
    },
  };

  const updateContactField = (
    field: keyof ContactSettings,
    newValue: ContactSettings[typeof field]
  ) => {
    onChange({ ...contact, [field]: newValue });
  };

  const updateArrayField = (field: 'emails' | 'phones', index: number, newValue: string) => {
    const list = (contact[field] ?? []) as string[];
    const nextList = [...list];
    nextList[index] = newValue;
    updateContactField(field, nextList);
  };

  const addArrayItem = (field: 'emails' | 'phones') => {
    updateContactField(field, [...((contact[field] as string[]) ?? []), '']);
  };

  const removeArrayItem = (field: 'emails' | 'phones', index: number) => {
    updateContactField(
      field,
      ((contact[field] as string[]) ?? []).filter((_, idx) => idx !== index)
    );
  };

  const updateSocial = (index: number, data: Partial<FooterSocialLink>) => {
    const list = contact.socialLinks ?? [];
    const nextList = [...list];
    nextList[index] = { ...nextList[index], ...data };
    updateContactField('socialLinks', nextList);
  };

  const addSocial = () => {
    updateContactField('socialLinks', [...(contact.socialLinks ?? []), createEmptySocial()]);
  };

  const removeSocial = (index: number) => {
    updateContactField(
      'socialLinks',
      (contact.socialLinks ?? []).filter((_, idx) => idx !== index)
    );
  };

  const updateLocationField = (
    field: 'address' | 'latitude' | 'longitude',
    newValue: string
  ) => {
    updateContactField('location', {
      ...(contact.location ?? { address: '', latitude: undefined, longitude: undefined }),
      [field]:
        field === 'latitude' || field === 'longitude'
          ? newValue === ''
            ? undefined
            : Number(newValue)
          : newValue,
    });
  };

  const handleSave = async () => {
    await onSave(contact);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>
            Update contact emails, support numbers, social profiles, and office location.
          </CardDescription>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Contact'}
        </Button>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Emails */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">Emails</h3>
              <p className="text-xs text-gray-500">
                Provide contact emails for support or general inquiries.
              </p>
            </div>
            <Button type="button" variant="outline" onClick={() => addArrayItem('emails')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Email
            </Button>
          </div>

          <div className="grid gap-3">
            {(contact.emails ?? []).length === 0 && (
              <p className="text-xs text-gray-500">No emails added yet.</p>
            )}

            {(contact.emails ?? []).map((email, index) => (
              <div key={index} className="flex items-center gap-3">
                <Input
                  value={email ?? ''}
                  onChange={(event) => updateArrayField('emails', index, event.target.value)}
                  placeholder="info@mawjood.sa"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeArrayItem('emails', index)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Phones */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">Phones</h3>
              <p className="text-xs text-gray-500">
                Add customer support or office phone numbers.
              </p>
            </div>
            <Button type="button" variant="outline" onClick={() => addArrayItem('phones')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Phone
            </Button>
          </div>

          <div className="grid gap-3">
            {(contact.phones ?? []).length === 0 && (
              <p className="text-xs text-gray-500">No contact numbers yet.</p>
            )}

            {(contact.phones ?? []).map((phone, index) => (
              <div key={index} className="flex items-center gap-3">
                <Input
                  value={phone ?? ''}
                  onChange={(event) => updateArrayField('phones', index, event.target.value)}
                  placeholder="+966 11 234 5678"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeArrayItem('phones', index)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Social Links */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
                Social Links
              </h3>
              <p className="text-xs text-gray-500">
                Add social media profiles for the contact page.
              </p>
            </div>
            <Button type="button" variant="outline" onClick={addSocial}>
              <Plus className="mr-2 h-4 w-4" />
              Add Social Link
            </Button>
          </div>

          <div className="grid gap-3">
            {(contact.socialLinks ?? []).length === 0 && (
              <p className="text-xs text-gray-500">No social links added yet.</p>
            )}

            {(contact.socialLinks ?? []).map((social, index) => (
              <div key={index} className="rounded-lg border border-gray-200 p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-gray-800">Social Link {index + 1}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSocial(index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-gray-600">Name</label>
                    <Input
                      value={social.name ?? ''}
                      onChange={(event) =>
                        updateSocial(index, { name: event.target.value })
                      }
                      placeholder="Facebook"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-gray-600">URL</label>
                    <Input
                      value={social.url ?? ''}
                      onChange={(event) =>
                        updateSocial(index, { url: event.target.value })
                      }
                      placeholder="https://facebook.com"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Location */}
        <section className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
              Headquarters Location
            </h3>
            <p className="text-xs text-gray-500">
              Provide the office address and map coordinates for maps or contact widgets.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Address</label>
            <Input
              value={contact.location?.address ?? ''}
              onChange={(event) => updateLocationField('address', event.target.value)}
              placeholder="King Fahd Road, Riyadh, Saudi Arabia"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Latitude</label>
              <Input
                value={
                  contact.location?.latitude !== undefined ? contact.location.latitude.toString() : ''
                }
                onChange={(event) => updateLocationField('latitude', event.target.value)}
                placeholder="24.7136"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Longitude</label>
              <Input
                value={
                  contact.location?.longitude !== undefined
                    ? contact.location.longitude.toString()
                    : ''
                }
                onChange={(event) => updateLocationField('longitude', event.target.value)}
                placeholder="46.6753"
              />
            </div>
          </div>
        </section>
      </CardContent>
    </Card>
  );
}


