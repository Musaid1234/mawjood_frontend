'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Globe2, Shield, Bell, FileText } from 'lucide-react';
import Link from 'next/link';

type SettingsSectionId = 'site' | 'legal' | 'notifications' | 'system';

interface CollapsibleCardProps {
  id: SettingsSectionId;
  title: string;
  description: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function CollapsibleCard({ title, description, isOpen, onToggle, children }: CollapsibleCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 sm:px-6 sm:py-4"
      >
        <div className="text-left">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h2>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">{description}</p>
        </div>
        <span className="ml-4 rounded-full border border-gray-200 bg-gray-50 p-1.5">
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </span>
      </button>
      {isOpen && (
        <div className="border-t border-gray-100 px-4 py-4 sm:px-6 sm:py-5">{children}</div>
      )}
    </div>
  );
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsSectionId>('site');
  const [openSection, setOpenSection] = useState<SettingsSectionId>('site');

  const handleTabChange = (value: string) => {
    const id = value as SettingsSectionId;
    setActiveTab(id);
    setOpenSection(id);
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Page header */}
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
          <p className="max-w-2xl text-sm text-gray-600">
            Configure global behaviour for Mawjood. Use the pills below to jump between settings
            areas, and expand a section to see its actions.
          </p>
        </header>

        {/* Sub tabs / pills navigation */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="flex flex-wrap gap-2 bg-transparent p-0">
            <TabsTrigger
              value="site"
              className="flex-1 basis-[140px] bg-white data-[state=active]:bg-[#1c4233] data-[state=active]:text-white"
            >
              <Globe2 className="h-4 w-4" />
              <span className="hidden sm:inline">Site experience</span>
              <span className="sm:hidden">Site</span>
            </TabsTrigger>
            <TabsTrigger
              value="legal"
              className="flex-1 basis-[140px] bg-white data-[state=active]:bg-[#1c4233] data-[state=active]:text-white"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Legal & content</span>
              <span className="sm:hidden">Legal</span>
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex-1 basis-[140px] bg-white data-[state=active]:bg-[#1c4233] data-[state=active]:text-white"
            >
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
              <span className="sm:hidden">Alerts</span>
            </TabsTrigger>
            <TabsTrigger
              value="system"
              className="flex-1 basis-[140px] bg-white data-[state=active]:bg-[#1c4233] data-[state=active]:text-white"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">System</span>
              <span className="sm:hidden">System</span>
            </TabsTrigger>
          </TabsList>

          {/* Site experience */}
          <TabsContent value="site" className="mt-4 space-y-4">
            <CollapsibleCard
              id="site"
              title="Site experience & layout"
              description="Hero content, homepage sections, currency, navigation, and footer links."
              isOpen={openSection === 'site'}
              onToggle={() => setOpenSection((current) => (current === 'site' ? 'system' : 'site'))}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    Manage how the public Mawjood website looks and feels: hero text, featured
                    sections, reviews, download banner, footer, and more.
                  </p>
                  <p className="text-xs text-gray-500">
                    This includes the global currency setting used across services and pricing.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href="/admin/settings/site">
                    <Button className="bg-[#1c4233] hover:bg-[#245240] text-white">
                      Open site settings
                    </Button>
                  </Link>
                </div>
              </div>
            </CollapsibleCard>
          </TabsContent>

          {/* Legal & content */}
          <TabsContent value="legal" className="mt-4 space-y-4">
            <CollapsibleCard
              id="legal"
              title="Legal pages & content"
              description="Terms & Conditions, Privacy Policy and other legal content."
              isOpen={openSection === 'legal'}
              onToggle={() =>
                setOpenSection((current) => (current === 'legal' ? 'site' : 'legal'))
              }
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    Legal page content is configured inside the site experience settings. Use the
                    &quot;Legal&quot; blocks there to update copy.
                  </p>
                  <p className="text-xs text-gray-500">
                    Links for Terms and Privacy are automatically reflected on registration and
                    footer areas.
                  </p>
                </div>
                <Link href="/admin/settings/site#legal">
                  <Button variant="outline">Go to legal content</Button>
                </Link>
              </div>
            </CollapsibleCard>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="mt-4 space-y-4">
            <CollapsibleCard
              id="notifications"
              title="Notifications & alerts"
              description="Control how subscription, billing, and system alerts behave."
              isOpen={openSection === 'notifications'}
              onToggle={() =>
                setOpenSection((current) =>
                  current === 'notifications' ? 'system' : 'notifications',
                )
              }
            >
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  Notification templates and behaviour are currently managed via backend logic
                  (subscription and billing controllers).
                </p>
                <p className="text-xs text-gray-500">
                  A dedicated UI for notification templates can be added here later without
                  changing the navigation structure.
                </p>
              </div>
            </CollapsibleCard>
          </TabsContent>

          {/* System */}
          <TabsContent value="system" className="mt-4 space-y-4">
            <CollapsibleCard
              id="system"
              title="System & maintenance"
              description="High-level technical settings and system status."
              isOpen={openSection === 'system'}
              onToggle={() =>
                setOpenSection((current) => (current === 'system' ? 'site' : 'system'))
              }
            >
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  System-level configuration (cron jobs, background tasks, and technical toggles)
                  is managed in the backend environment.
                </p>
                <p className="text-xs text-gray-500">
                  Use this area in the future to surface read-only health status or maintenance
                  switches, without changing the overall settings layout.
                </p>
              </div>
            </CollapsibleCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}