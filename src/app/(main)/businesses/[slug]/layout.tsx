import { Metadata } from 'next';
import { businessService } from '@/services/business.service';
import { buildOgImages, toAbsoluteUrl } from '@/config/seo.config';

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Omit<Props, 'children'>): Promise<Metadata> {
  const { slug } = await params;
  try {
    const business = await businessService.getBusinessBySlug(slug);

    const title = business.metaTitle || `${business.name} - ${business.city.name} | Mawjood`;
    const description = business.metaDescription || business.description ||
      `Find ${business.name} in ${business.city.name}. ${business.category.name} services with contact details, location, working hours, and reviews.`;

    const { absolute: ogImage } = buildOgImages(business.coverImage || business.logo);
    const canonical = toAbsoluteUrl(`/businesses/${business.slug}`);

    return {
      title,
      description,
      keywords: business.keywords?.join(', ') ||
        `${business.name}, ${business.category.name}, ${business.city.name}, business listing, ${business.address}`,
      openGraph: {
        title,
        description,
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: business.name,
          },
        ],
        type: 'website',
        locale: 'en_US',
        siteName: 'Mawjood',
        url: canonical,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImage],
      },
      alternates: {
        canonical,
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

export default async function BusinessDetailLayout({ children, params }: Props) {
  await params;
  return <>{children}</>;
}