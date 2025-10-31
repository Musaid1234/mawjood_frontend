import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Blog | Mawjood',
    description: 'Blog page',
    keywords: 'blog, Mawjood',
    openGraph: {
        title: 'Blog | Mawjood',
        description: 'Blog page',
        type: 'website',
    },
};

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}