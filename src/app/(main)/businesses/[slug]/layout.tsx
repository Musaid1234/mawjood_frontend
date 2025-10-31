import { Metadata } from 'next';
import { businessService } from '@/services/business.service';
import { notFound } from 'next/navigation';

interface Props {
  params: { slug: string };
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Omit<Props, 'children'>): Promise<Metadata> {
  try {
    const business = await businessService.getBusinessBySlug(params.slug);

    const title = business.metaTitle || `${business.name} - ${business.city.name} | Mawjood`;
    const description = business.metaDescription || business.description || 
      `Find ${business.name} in ${business.city.name}. ${business.category.name} services with contact details, location, working hours, and reviews.`;
    
    const images = [
      business.coverImage || business.logo || '/og-default.jpg'
    ].filter(Boolean);

    return {
        title,
        description,
        keywords: business.keywords || 
          `${business.name}, ${business.category.name}, ${business.city.name}, business listing, ${business.address}`,
      
        openGraph: {
            title,
            description,
            images: images.map(img => ({
              url: img,
              width: 1200,
              height: 630,
              alt: business.name,
            })),
            type: 'website',
            locale: 'en_US',
            siteName: 'Mawjood',
          },

      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images,
      },

      alternates: {
        canonical: `/businesses/${business.slug}`,
      },

      robots: {
        index: business.status === 'APPROVED',
        follow: true,
      },
    };
  } catch (error) {
    return {
      title: 'Business Not Found | Mawjood',
      description: 'The business you are looking for could not be found.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

export default function BusinessDetailLayout({ children }: Props) {
  return <>{children}</>;
}