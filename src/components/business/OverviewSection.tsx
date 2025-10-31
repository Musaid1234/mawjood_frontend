'use client';

import { FileText, Tag } from 'lucide-react';
import { Business } from '@/services/business.service';
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, Key } from 'react';

interface Props {
  business: Business;
}

export default function OverviewSection({ business }: Props) {
    const keywords = Array.isArray(business.keywords) 
    ? business.keywords 
    : [];

  return (
    <section id="overview" className="bg-white rounded-lg shadow-sm p-6 scroll-mt-48">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">About</h2>
      </div>

      <div 
        className="prose max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-li:text-gray-700"
        dangerouslySetInnerHTML={{ __html: business.description || '' }}
      />

      {keywords.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-gray-600" />
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Keywords
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | Iterable<ReactNode> | null | undefined, index: Key | null | undefined) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}