import { Trash2, Edit, Youtube } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { useCurrency } from '@/hooks/useCurrency';

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration?: number;
  image?: string;
  youtubeUrl?: string;
}

interface ServiceCardProps {
  businessName: string;
  businessLogo: string;
  service: Service;
  onDelete: (serviceId: string) => void;
  onEdit: (service: Service) => void;
}

export default function ServiceCard({ businessName, businessLogo, service, onDelete, onEdit }: ServiceCardProps) {
  const { currency } = useCurrency();
  
  return (
        <Card className="border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden bg-white py-0">
          <CardContent className="p-5 space-y-5">
            
            {/* Service Image */}
            {service.image && (
              <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
                <Image src={service.image} alt={service.name} fill className="object-cover" />
              </div>
            )}

            {/* Business Info */}
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border border-gray-200 bg-gray-50">
                  <Image src={businessLogo} alt={businessName} fill className="object-cover" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Business</p>
                  <h2 className="text-base font-semibold text-gray-900">{businessName}</h2>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onEdit(service)}
                  className="p-2 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Edit className="w-4 h-4 text-blue-600" />
                </button>
                <button
                  onClick={() => onDelete(service.id)}
                  className="p-2 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
      
            {/* Service Details */}
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-gray-900">{service.name}</h3>
              {service.description && (
                <p className="text-sm text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              )}
            </div>
      
            {/* Price & YouTube */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center gap-2 bg-emerald-50 px-3 py-2 rounded-xl">
                <span className="font-semibold text-emerald-700">{currency} {service.price}</span>
              </div>
              {service.youtubeUrl && (
                <a
                  href={service.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-red-50 px-3 py-2 rounded-xl hover:bg-red-100 transition-colors"
                >
                  <Youtube className="w-4 h-4 text-red-600" />
                  <span className="font-medium text-red-700">Watch Video</span>
                </a>
              )}
            </div>
            
          </CardContent>
        </Card>
      );
      
}