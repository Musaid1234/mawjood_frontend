import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Mawjood',
  description: 'Read our privacy policy to understand how we collect, use, and protect your personal information on Mawjood.',
  keywords: 'privacy policy, data protection, privacy, Mawjood, user privacy',
  openGraph: {
    title: 'Privacy Policy | Mawjood',
    description: 'Read our privacy policy to understand how we collect, use, and protect your personal information on Mawjood.',
    type: 'website',
    url: '/privacy',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=630&fit=crop',
        width: 1200,
        height: 630,
        alt: 'Privacy Policy - Mawjood',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy | Mawjood',
    description: 'Read our privacy policy to understand how we collect, use, and protect your personal information on Mawjood.',
    images: ['https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=630&fit=crop'],
  },
  alternates: {
    canonical: '/privacy',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

