import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Categories - Mawjood',
  description: 'Browse all business categories',
};

export default function CategoriesLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}