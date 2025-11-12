'use client';

import { NavbarSettings } from '@/services/settings.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface NavbarSettingsSectionProps {
  value: NavbarSettings;
  onChange: (value: NavbarSettings) => void;
  onSave: (value: NavbarSettings) => Promise<void>;
  isSaving: boolean;
}

export function NavbarSettingsSection({
  value,
  onChange,
  onSave,
  isSaving,
}: NavbarSettingsSectionProps) {
  const navbar: NavbarSettings = value ?? { logoUrl: '', brandName: '', tagline: '' };

  const updateNavbarField = (
    field: keyof NavbarSettings,
    newValue: NavbarSettings[typeof field]
  ) => {
    onChange({ ...navbar, [field]: newValue });
  };

  const handleSave = async () => {
    await onSave(navbar);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Navbar Branding</CardTitle>
          <CardDescription>
            Update the logo, brand name, and tagline displayed across the site navigation.
          </CardDescription>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Navbar'}
        </Button>
      </CardHeader>

      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-gray-700">Logo URL</label>
          <Input
            value={navbar.logoUrl ?? ''}
            onChange={(event) => updateNavbarField('logoUrl', event.target.value)}
            placeholder="https://..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Brand Name</label>
          <Input
            value={navbar.brandName ?? ''}
            onChange={(event) => updateNavbarField('brandName', event.target.value)}
            placeholder="Mawjood"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Tagline</label>
          <Input
            value={navbar.tagline ?? ''}
            onChange={(event) => updateNavbarField('tagline', event.target.value)}
            placeholder="Discover & connect locally"
          />
        </div>
      </CardContent>
    </Card>
  );
}


