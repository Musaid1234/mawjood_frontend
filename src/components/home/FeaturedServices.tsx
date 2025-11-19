'use client';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import Image from 'next/image';
import { useCityStore } from '@/store/cityStore';
import { useSiteSettings } from '@/hooks/useSiteSettings';

interface ServiceItem {
  id: string;
  name: string;
  image: string;
  slug: string;
}

interface ServiceSection {
  id: string;
  title: string;
  subtitle?: string;
  items: ServiceItem[];
}

export default function FeaturedServices() {
  const { t } = useTranslation('common');
  const { data: siteSettings } = useSiteSettings();
  const { selectedLocation, selectedCity, cities, fetchCities } = useCityStore();

  const locationSlug =
    selectedLocation?.slug ||
    selectedCity?.slug ||
    cities.find((city) => city.name.toLowerCase().includes('riyadh'))?.slug ||
    cities[0]?.slug ||
    'riyadh';

  useEffect(() => {
    if (!cities.length) {
      fetchCities();
    }
  }, [cities.length, fetchCities]);

  const defaultSections: ServiceSection[] = [
    {
      id: 'home-services',
      title: t('featuredServices.homeServices.title') || 'Home Services',
      items: [
        {
          id: 'cleaning',
          name: t('featuredServices.homeServices.cleaning') || 'Cleaning Services',
          image: 'https://images.pexels.com/photos/4108715/pexels-photo-4108715.jpeg?auto=compress&cs=tinysrgb&w=400',
          slug: 'cleaning-services',
        },
        {
          id: 'plumbing',
          name: t('featuredServices.homeServices.plumbing') || 'Plumbing',
          image: 'https://media.istockphoto.com/id/183953925/photo/young-plumber-fixing-a-sink-in-bathroom.jpg?s=612x612&w=0&k=20&c=Ps2U_U4_Z60mIZsuem-BoaHLlCjsT8wYWiXNWR-TCDA=',
          slug: 'plumbing',
        },
        {
          id: 'painting',
          name: t('featuredServices.homeServices.painting') || 'Painting',
          image: 'https://5.imimg.com/data5/SELLER/Default/2021/6/MY/NI/YW/52844401/wall-paintings.jpg',
          slug: 'painting',
        },
      ],
    },
    {
      id: 'beauty-spa',
      title: t('featuredServices.beautySpa.title') || 'Beauty & Spa',
      items: [
        {
          id: 'beauty-parlours',
          name: t('featuredServices.beautySpa.beautyParlours') || 'Beauty Parlours',
          image: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=400',
          slug: 'beauty-parlours',
        },
        {
          id: 'spa-massages',
          name: t('featuredServices.beautySpa.spaMassages') || 'Spa & Massages',
          image: 'https://images.pexels.com/photos/3757952/pexels-photo-3757952.jpeg?auto=compress&cs=tinysrgb&w=400',
          slug: 'spa-massages',
        },
        {
          id: 'salons',
          name: t('featuredServices.beautySpa.salons') || 'Salons',
          image: 'https://images.pexels.com/photos/3993462/pexels-photo-3993462.jpeg?auto=compress&cs=tinysrgb&w=400',
          slug: 'salons',
        },
      ],
    },
    {
      id: 'repairs-services',
      title: t('featuredServices.repairsServices.title') || 'Repairs & Services',
      items: [
        {
          id: 'ac-service',
          name: t('featuredServices.repairsServices.acService') || 'AC Service',
          image: 'https://www.rightcliq.in/blogs/images/blogs/ac-repair-service.jpg',
          slug: 'ac-service',
        },
        {
          id: 'car-service',
          name: t('featuredServices.repairsServices.carService') || 'Car Service',
          image: 'https://images.pexels.com/photos/3806288/pexels-photo-3806288.jpeg?auto=compress&cs=tinysrgb&w=400',
          slug: 'car-service',
        },
        {
          id: 'bike-service',
          name: t('featuredServices.repairsServices.bikeService') || 'Bike Service',
          image: 'https://media.istockphoto.com/id/1363985678/photo/a-man-in-the-garage-is-checking-a-motorcycle.jpg?s=612x612&w=0&k=20&c=FYGJvzMS87Doci4v-GBAxHPR0B6Fi4vfVkTQMAxqE3s=',
          slug: 'bike-service',
        },
      ],
    },
    {
      id: 'daily-needs',
      title: t('featuredServices.dailyNeeds.title') || 'Daily Needs',
      items: [
        {
          id: 'movies',
          name: t('featuredServices.dailyNeeds.movies') || 'Movies',
          image: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400',
          slug: 'movies',
        },
        {
          id: 'grocery',
          name: t('featuredServices.dailyNeeds.grocery') || 'Grocery',
          image: 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=400',
          slug: 'grocery',
        },
        {
          id: 'electricians',
          name: t('featuredServices.dailyNeeds.electricians') || 'Electricians',
          image: 'https://img.freepik.com/free-photo/man-electrical-technician-working-switchboard-with-fuses_169016-24062.jpg?semt=ais_hybrid&w=740&q=80   ',
          slug: 'electricians',
        },
      ],
    },
  ];

  const settingsSections =
    siteSettings?.featuredSections?.map((section) => ({
      id: section.id,
      title: section.title,
      subtitle: section.subtitle,
      items: section.items?.map((item) => ({
        id: item.id,
        name: item.name,
        image: item.image ?? '',
        slug: item.slug,
      })) ?? [],
    })) ?? null;

  const sections = settingsSections?.length ? settingsSections : defaultSections;

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
  <div className="max-w-7xl mx-auto space-y-14">
    {sections.map((section) => (
      <div key={section.id}>
        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-800 tracking-tight">
              {section.title}
            </h3>
            {section.subtitle && (
              <p className="text-sm text-gray-500 mt-1 max-w-xl">
                {section.subtitle}
              </p>
            )}
          </div>
          <Link
            href={`/${locationSlug}/${section.id}`}
            className="text-primary font-medium hover:underline whitespace-nowrap"
          >
            View More →
          </Link>
        </div>

        {/* 6 columns grid - scrollable on mobile */}
        <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide scroll-smooth sm:flex-nowrap lg:grid lg:grid-cols-6 lg:gap-6 lg:overflow-visible lg:pb-0">
          {section.items.map((item) => (
            <Link
              key={item.id}
              href={`/${locationSlug}/${item.slug}`}
              className="group block relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 flex-shrink-0 w-40 lg:w-auto"
            >
              {/* Image */}
              <div className="relative h-48 sm:h-56 md:h-64 w-full aspect-square">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-90 group-hover:opacity-80 transition-opacity"></div>
              </div>

              {/* Text Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 text-white">
                <h4 className="text-sm sm:text-base font-semibold mb-1 drop-shadow-md line-clamp-2">
                  {item.name}
                </h4>
                <p className="text-xs text-gray-200 line-clamp-1">Explore top {item.name.toLowerCase()} near you</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    ))}
  </div>
</section>
  );
  
}