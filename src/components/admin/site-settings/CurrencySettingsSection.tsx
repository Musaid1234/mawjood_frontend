'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CurrencySettingsSectionProps {
  value: string;
  onChange: (value: string) => void;
  onSave: (value: string) => Promise<void>;
  isSaving: boolean;
}

const COMMON_CURRENCIES = [
  { code: 'SAR', name: 'Saudi Riyal (SAR)' },
  { code: 'USD', name: 'US Dollar (USD)' },
  { code: 'EUR', name: 'Euro (EUR)' },
  { code: 'GBP', name: 'British Pound (GBP)' },
  { code: 'AED', name: 'UAE Dirham (AED)' },
  { code: 'KWD', name: 'Kuwaiti Dinar (KWD)' },
  { code: 'BHD', name: 'Bahraini Dinar (BHD)' },
  { code: 'OMR', name: 'Omani Rial (OMR)' },
  { code: 'QAR', name: 'Qatari Riyal (QAR)' },
  { code: 'JOD', name: 'Jordanian Dinar (JOD)' },
  { code: 'EGP', name: 'Egyptian Pound (EGP)' },
  { code: 'INR', name: 'Indian Rupee (INR)' },
  { code: 'PKR', name: 'Pakistani Rupee (PKR)' },
];

export function CurrencySettingsSection({
  value,
  onChange,
  onSave,
  isSaving,
}: CurrencySettingsSectionProps) {
  const currency = value || 'SAR';

  const handleSave = async () => {
    await onSave(currency);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Currency Settings</CardTitle>
          <CardDescription>
            Set the default currency code to be displayed throughout the site (services, prices, etc.).
          </CardDescription>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Currency'}
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Select Currency</label>
          <p className="text-sm text-gray-500 mb-4">
            Choose the default currency code to be displayed with all prices on the site.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {COMMON_CURRENCIES.map((curr) => (
              <button
                key={curr.code}
                type="button"
                onClick={() => onChange(curr.code)}
                className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                  currency === curr.code
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-primary hover:text-primary'
                }`}
              >
                {curr.code}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

