'use client';

import { Briefcase, Clock, DollarSign } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description?: string;
  price?: number;
  duration?: number;
}

interface Props {
  services: Service[];
}

export default function ServicesSection({ services }: Props) {
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
                  <span>SAR - {service.price}</span>
                </div>
              )}
              
              {service.duration && (
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{service.duration} min</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}