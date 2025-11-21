import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mawjood',
  description: 'Find local businesses and services',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  const cloudinaryUrl = 'https://res.cloudinary.com';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to important origins for faster resource loading */}
        {apiBaseUrl && (
          <>
            <link rel="preconnect" href={apiBaseUrl} crossOrigin="anonymous" />
            <link rel="dns-prefetch" href={apiBaseUrl} />
          </>
        )}
        <link rel="preconnect" href={cloudinaryUrl} crossOrigin="anonymous" />
        <link rel="dns-prefetch" href={cloudinaryUrl} />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}