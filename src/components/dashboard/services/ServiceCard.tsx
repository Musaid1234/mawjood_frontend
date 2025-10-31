import { Clock, DollarSign, Trash2, Edit } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
}

interface ServiceCardProps {
  businessName: string;
  businessLogo: string;
  service: Service;
  onDelete: (serviceId: string) => void;
}

export default function ServiceCard({ businessName, businessLogo, service, onDelete }: ServiceCardProps) {
    return (
        <Card className="border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden bg-white py-0">
          <CardContent className="p-5 space-y-5">
            
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
                <button className="p-2 rounded-lg hover:bg-blue-100 transition-colors">
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
      
            {/* Price & Duration */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center gap-2 bg-emerald-50 px-3 py-2 rounded-xl">
                <span className="font-semibold text-emerald-700">SAR {service.price} SAR</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-xl">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-700">{service.duration} min</span>
              </div>
            </div>
            
          </CardContent>
        </Card>
      );
      
}