'use client';

import { Loader2 } from 'lucide-react';
import { useMemo } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { LegalContentSettings } from '@/services/settings.service';

type LegalDocumentKey = 'terms' | 'privacy';

interface LegalDocumentProps {
  settingKey: LegalDocumentKey;
  defaultTitle: string;
  defaultFallbackMessage?: string;
}

const hasHtml = (value: string) => /<\/?[a-z][\s\S]*>/i.test(value);

export function LegalDocument({
  settingKey,
  defaultTitle,
  defaultFallbackMessage = 'Content will be available soon.',
}: LegalDocumentProps) {
  const { data, isLoading, isFetching } = useSiteSettings();

  const legalContent = useMemo(() => {
    const rawValue = (data?.[settingKey] ?? null) as LegalContentSettings | string | null;

    if (!rawValue) {
      return null;
    }

    if (typeof rawValue === 'string') {
      return {
        title: defaultTitle,
        content: rawValue,
      } satisfies LegalContentSettings;
    }

    return rawValue;
  }, [data, settingKey, defaultTitle]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-gray-500">Loading content...</p>
      </div>
    );
  }

  const title = legalContent?.title?.trim() || defaultTitle;
  const content = legalContent?.content?.trim() ?? '';
  const updatedAt = legalContent?.updatedAt ?? legalContent?.lastUpdated;
  const hasContent = Boolean(content.length);

  const formattedDate =
    updatedAt && !Number.isNaN(Date.parse(updatedAt))
      ? new Date(updatedAt).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : null;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8 space-y-3 text-center sm:mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{title}</h1>
        {formattedDate ? (
          <p className="text-sm text-gray-500">Last updated on {formattedDate}</p>
        ) : null}
        {isFetching ? (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Refreshing latest content…</span>
          </div>
        ) : null}
      </header>

      <section className="prose prose-gray max-w-none pb-20 text-gray-700 sm:prose-lg">
        {hasContent ? (
          hasHtml(content) ? (
            <div dangerouslySetInnerHTML={{ __html: content }} />
          ) : (
            content.split(/\n{2,}/).map((paragraph, index) => (
              <p key={index}>{paragraph.trim()}</p>
            ))
          )
        ) : (
          <p className="text-center text-gray-500">{defaultFallbackMessage}</p>
        )}
      </section>
    </div>
  );
}


