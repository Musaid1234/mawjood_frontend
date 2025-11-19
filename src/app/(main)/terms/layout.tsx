import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Mawjood',
  description: 'Read our terms and conditions to understand the rules and guidelines for using the Mawjood platform.',
  keywords: 'terms and conditions, terms of service, user agreement, Mawjood, legal terms',
  openGraph: {
    title: 'Terms & Conditions | Mawjood',
    description: 'Read our terms and conditions to understand the rules and guidelines for using the Mawjood platform.',
    type: 'website',
    url: '/terms',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&h=630&fit=crop',
        width: 1200,
        height: 630,
        alt: 'Terms & Conditions - Mawjood',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms & Conditions | Mawjood',
    description: 'Read our terms and conditions to understand the rules and guidelines for using the Mawjood platform.',
    images: ['https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&h=630&fit=crop'],
  },
  alternates: {
    canonical: '/terms',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

