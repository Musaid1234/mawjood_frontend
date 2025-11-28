'use client';

import { NavbarSettings } from '@/services/settings.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

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
  const [logoPreview, setLogoPreview] = useState<string>('');

  const updateNavbarField = (
    field: keyof NavbarSettings,
    newValue: NavbarSettings[typeof field]
  ) => {
    onChange({ ...navbar, [field]: newValue });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        updateNavbarField('logoUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoPreview('');
    updateNavbarField('logoUrl', '');
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
          <label className="text-sm font-medium text-gray-700">Logo</label>
          
          {(logoPreview || navbar.logoUrl) && (
            <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-300">
              <Image
                src={logoPreview || navbar.logoUrl || ''}
                alt="Logo preview"
                fill
                className="object-contain p-4"
              />
              <button
                type="button"
                onClick={removeLogo}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <label
            htmlFor="logo-upload"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#1c4233] transition-colors bg-gray-50"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Click to upload</span> logo
              </p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, SVG up to 10MB</p>
            </div>
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
            />
          </label>
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


