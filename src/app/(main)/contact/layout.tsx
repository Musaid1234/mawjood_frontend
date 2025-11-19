import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | Mawjood',
  description: 'Get in touch with Mawjood. Contact us for support, business inquiries, or any questions. We are here to help you.',
  keywords: 'contact, support, help, customer service, Mawjood contact, business inquiry',
  openGraph: {
    title: 'Contact Us | Mawjood',
    description: 'Get in touch with Mawjood. Contact us for support, business inquiries, or any questions. We are here to help you.',
    type: 'website',
    url: '/contact',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200',
        width: 1200,
        height: 630,
        alt: 'Contact Mawjood',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us | Mawjood',
    description: 'Get in touch with Mawjood. Contact us for support, business inquiries, or any questions. We are here to help you.',
    images: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200'],
  },
  alternates: {
    canonical: '/contact',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

