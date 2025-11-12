import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api.config';
import { buildOgImages, toAbsoluteUrl } from '@/config/seo.config';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image?: string | null;
  icon?: string | null;
}

interface City {
  id: string;
  name: string;
  slug: string;
}

const formatSlugToName = (slug: string) =>
  slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

async function fetchCategory(slug: string): Promise<Category | null> {
  try {
    const url = `${API_BASE_URL}${API_ENDPOINTS.CATEGORIES.GET_BY_SLUG(slug)}`;
    const res = await fetch(url, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.data || null;
  } catch {
    return null;
  }
}

async function fetchCityBySlug(slug: string): Promise<City | null> {
  try {
    const url = `${API_BASE_URL}${API_ENDPOINTS.CITIES.GET_BY_SLUG(slug)}`;
    const res = await fetch(url, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.data || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; category: string }>;
}): Promise<Metadata> {
  const { city, category } = await params;

  const [categoryData, cityData] = await Promise.all([
    fetchCategory(category),
    fetchCityBySlug(city),
  ]);

  if (!categoryData) {
    return {
      title: 'Category - Mawjood',
      description: 'Browse businesses by category',
    };
  }

  const cityName = cityData?.name || formatSlugToName(city);
  const categoryName = categoryData.name;
  const path = `/${city}/${category}`;
  const canonical = toAbsoluteUrl(path);
  const description = `Discover top-rated ${categoryName.toLowerCase()} businesses in ${cityName}. Browse verified listings, read reviews, and find the best ${categoryName.toLowerCase()} services near you.`;
  const title = `Find Best ${categoryName} Near You - ${cityName} | Mawjood`;
  const { absolute: ogImage } = buildOgImages(categoryData.image || categoryData.icon);

  return {
    title,
    description,
    keywords: [
      `best ${categoryName.toLowerCase()} in ${cityName}`,
      `${categoryName.toLowerCase()} ${cityName}`,
      `top ${categoryName.toLowerCase()} near me`,
      `${categoryName.toLowerCase()} services ${cityName}`,
      `find ${categoryName.toLowerCase()} ${cityName}`,
    ].join(', '),
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'en_US',
      siteName: 'Mawjood',
      url: canonical,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${categoryName} in ${cityName}`,
        },
      ],
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
    other: {
      'geo.region': 'SA',
      'geo.placename': cityName,
    },
  };
}

export default function CityCategoryLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

