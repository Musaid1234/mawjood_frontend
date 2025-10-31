'use client';

import { Phone, Mail, Globe, MapPin, Clock, CheckCircle, Shield } from 'lucide-react';

interface Business {
  phone?: string;
  email: string;
  website?: string;
  address: string;
  city: {
    name: string;
  };
  isVerified: boolean;
  crVerified?: boolean;
  crNumber?: string | null;
}

interface Props {
  business: Business;
}

export default function QuickInfoSection({ business }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-primary" />
        Quick Info
      </h3>

      <div className="space-y-4">
        {/* Phone */}
        {business.phone && (
          <div className="flex items-start gap-3 group">
            <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
              <Phone className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Phone</p>
              <a
                href={`tel:${business.phone}`}
                className="text-sm font-medium text-gray-900 hover:text-primary break-all"
              >
                {business.phone}
              </a>
            </div>
          </div>
        )}

        {/* Email */}
        <div className="flex items-start gap-3 group">
          <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
            <Mail className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email</p>
            <a
              href={`mailto:${business.email}`}
              className="text-sm font-medium text-gray-900 hover:text-primary break-all"
            >
              {business.email}
            </a>
          </div>
        </div>

        {/* Website */}
        {business.website && (
          <div className="flex items-start gap-3 group">
            <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
              <Globe className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Website</p>
              <a
                href={business.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-gray-900 hover:text-primary break-all"
              >
                {business.website.replace(/^https?:\/\/(www\.)?/, '')}
              </a>
            </div>
          </div>
        )}

        {/* Address */}
        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-50 rounded-lg">
            <MapPin className="w-4 h-4 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Address</p>
            <p className="text-sm font-medium text-gray-900">
              {business.address}
            </p>
          </div>
        </div>

        {/* Verification Badges */}
        <div className="pt-4 border-t border-gray-200 space-y-3">
          {business.isVerified && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-5 h-5 text-blue-500" />
              <span className="text-gray-700 font-medium">Verified Business</span>
            </div>
          )}

          {business.crVerified && business.crNumber && (
            <div className="flex items-start gap-2 text-sm">
              <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-700 font-medium">CR Verified</p>
                <p className="text-gray-500 text-xs mt-0.5">CR: {business.crNumber}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}