'use client';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import Image from 'next/image';

interface ServiceItem {
  id: string;
  name: string;
  image: string;
  link: string;
}

interface ServiceSection {
  id: string;
  title: string;
  items: ServiceItem[];
}

export default function FeaturedServices() {
  const { t } = useTranslation('common');

  const sections: ServiceSection[] = [
    {
      id: 'home-services',
      title: t('featuredServices.homeServices.title') || 'Home Services',
      items: [
        {
          id: 'cleaning',
          name: t('featuredServices.homeServices.cleaning') || 'Cleaning Services',
          image: 'https://images.pexels.com/photos/4108715/pexels-photo-4108715.jpeg?auto=compress&cs=tinysrgb&w=400', // Add your image path
          link: '/categories/cleaning-services',
        },
        {
          id: 'plumbing',
          name: t('featuredServices.homeServices.plumbing') || 'Plumbing',
          image: 'https://media.istockphoto.com/id/183953925/photo/young-plumber-fixing-a-sink-in-bathroom.jpg?s=612x612&w=0&k=20&c=Ps2U_U4_Z60mIZsuem-BoaHLlCjsT8wYWiXNWR-TCDA=', // Add your image path
          link: '/categories/plumbing',
        },
        {
          id: 'painting',
          name: t('featuredServices.homeServices.painting') || 'Painting',
          image: 'https://5.imimg.com/data5/SELLER/Default/2021/6/MY/NI/YW/52844401/wall-paintings.jpg', // Add your image path
          link: '/categories/painting',
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
          image: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=400', // Add your image path
          link: '/categories/beauty-parlours',
        },
        {
          id: 'spa-massages',
          name: t('featuredServices.beautySpa.spaMassages') || 'Spa & Massages',
          image: 'https://images.pexels.com/photos/3757952/pexels-photo-3757952.jpeg?auto=compress&cs=tinysrgb&w=400', // Add your image path
          link: '/categories/spa-massages',
        },
        {
          id: 'salons',
          name: t('featuredServices.beautySpa.salons') || 'Salons',
          image: 'https://images.pexels.com/photos/3993462/pexels-photo-3993462.jpeg?auto=compress&cs=tinysrgb&w=400', // Add your image path
          link: '/categories/salons',
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
          image: 'https://www.rightcliq.in/blogs/images/blogs/ac-repair-service.jpg', // Add your image path
          link: '/categories/ac-service',
        },
        {
          id: 'car-service',
          name: t('featuredServices.repairsServices.carService') || 'Car Service',
          image: 'https://images.pexels.com/photos/3806288/pexels-photo-3806288.jpeg?auto=compress&cs=tinysrgb&w=400', // Add your image path
          link: '/categories/car-service',
        },
        {
          id: 'bike-service',
          name: t('featuredServices.repairsServices.bikeService') || 'Bike Service',
          image: 'https://media.istockphoto.com/id/1363985678/photo/a-man-in-the-garage-is-checking-a-motorcycle.jpg?s=612x612&w=0&k=20&c=FYGJvzMS87Doci4v-GBAxHPR0B6Fi4vfVkTQMAxqE3s=', // Add your image path
          link: '/categories/bike-service',
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
          image: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400', // Add your image path
          link: '/categories/movies',
        },
        {
          id: 'grocery',
          name: t('featuredServices.dailyNeeds.grocery') || 'Grocery',
          image: 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=400', // Add your image path
          link: '/categories/grocery',
        },
        {
          id: 'electricians',
          name: t('featuredServices.dailyNeeds.electricians') || 'Electricians',
          image: 'https://img.freepik.com/free-photo/man-electrical-technician-working-switchboard-with-fuses_169016-24062.jpg?semt=ais_hybrid&w=740&q=80   ', // Add your image path
          link: '/categories/electricians',
        },
      ],
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
  <div className="max-w-7xl mx-auto space-y-14">
    {sections.map((section) => (
      <div key={section.id}>
        {/* Section Title */}
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-gray-800 tracking-tight">
            {section.title}
          </h3>
          <Link
            href={`/categories/${section.id}`}
            className="text-primary font-medium hover:underline"
          >
            View More →
          </Link>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {section.items.map((item) => (
            <Link key={item.id} href={item.link} className="group block relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500">
              {/* Image */}
              <div className="relative h-60 sm:h-64 md:h-72 w-full">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-90 group-hover:opacity-80 transition-opacity"></div>
              </div>

              {/* Text Overlay */}
              <div className="absolute bottom-0 left-0 p-4 sm:p-5 text-white">
                <h4 className="text-lg sm:text-xl font-semibold mb-1 drop-shadow-md">
                  {item.name}
                </h4>
                <p className="text-sm text-gray-200">Explore top {item.name.toLowerCase()} near you</p>
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