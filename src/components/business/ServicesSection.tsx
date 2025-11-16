'use client';

import { Briefcase, Youtube } from 'lucide-react';
import Image from 'next/image';
import { useCurrency } from '@/hooks/useCurrency';

interface Service {
  id: string;
  name: string;
  description?: string;
  price?: number;
  duration?: number;
  image?: string;
  youtubeUrl?: string;
}

interface Props {
  services: Service[];
}

export default function ServicesSection({ services }: Props) {
  const { currency } = useCurrency();
  
  if (!services || services.length === 0) {
        return (
          <section id="services" className="bg-white rounded-lg shadow-sm p-6 scroll-mt-48">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Services</h2>
            </div>
            <div className="text-center py-8">
              <p className="text-gray-500">No services available at the moment.</p>
            </div>
          </section>
        );
      }

  return (
    <section id="services" className="bg-white rounded-lg shadow-sm p-6 scroll-mt-48">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Briefcase className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Services</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => (
          <div
            key={service.id}
            className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:shadow-md transition-all"
          >
            {/* Service Image */}
            {service.image && (
              <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100 mb-3">
                <Image src={service.image} alt={service.name} fill className="object-cover" />
              </div>
            )}

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {service.name}
            </h3>
            
            {service.description && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {service.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm">
              {service.price && (
                <div className="flex items-center gap-1.5 text-green-600 font-semibold">
                  <span>{currency} {service.price}</span>
                </div>
              )}

              {service.youtubeUrl && (
                <a
                  href={service.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-red-600 hover:text-red-700 transition-colors"
                >
                  <Youtube className="w-4 h-4" />
                  <span>Watch Video</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}