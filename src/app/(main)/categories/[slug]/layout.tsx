import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Category - Mawjood',
  description: 'Browse businesses by category',
};

export default function CategoryLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}