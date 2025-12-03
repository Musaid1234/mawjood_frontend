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

// Common country codes (1-4 digits)
const COUNTRY_CODES = [
  '+1', '+7', '+20', '+27', '+30', '+31', '+32', '+33', '+34', '+36', '+39', '+40', '+41', '+43', '+44', '+45', '+46', '+47', '+48', '+49',
  '+51', '+52', '+53', '+54', '+55', '+56', '+57', '+58', '+60', '+61', '+62', '+63', '+64', '+65', '+66', '+81', '+82', '+84', '+86', '+90', '+91', '+92', '+93', '+94', '+95', '+98',
  '+212', '+213', '+216', '+218', '+220', '+221', '+222', '+223', '+224', '+225', '+226', '+227', '+228', '+229', '+230', '+231', '+232', '+233', '+234', '+235', '+236', '+237', '+238', '+240', '+241', '+242', '+243', '+244', '+245', '+246', '+248', '+249', '+250', '+251', '+252', '+253', '+254', '+255', '+256', '+257', '+258', '+260', '+261', '+262', '+263', '+264', '+265', '+266', '+267', '+268', '+269',
  '+290', '+291', '+297', '+298', '+299', '+350', '+351', '+352', '+353', '+354', '+355', '+356', '+357', '+358', '+359', '+370', '+371', '+372', '+373', '+374', '+375', '+376', '+377', '+378', '+380', '+381', '+382', '+383', '+385', '+386', '+387', '+389',
  '+420', '+421', '+423', '+500', '+501', '+502', '+503', '+504', '+505', '+506', '+507', '+508', '+509', '+590', '+591', '+592', '+593', '+594', '+595', '+596', '+597', '+598', '+599',
  '+670', '+672', '+673', '+674', '+675', '+676', '+677', '+678', '+679', '+680', '+681', '+682', '+683', '+684', '+685', '+686', '+687', '+688', '+689', '+690', '+691', '+692',
  '+850', '+852', '+853', '+855', '+856', '+880', '+886', '+960', '+961', '+962', '+963', '+964', '+965', '+966', '+967', '+968', '+970', '+971', '+972', '+973', '+974', '+975', '+976', '+977',
  '+992', '+993', '+994', '+995', '+996', '+998',
  '+1242', '+1246', '+1264', '+1268', '+1284', '+1340', '+1345', '+1441', '+1473', '+1649', '+1664', '+1670', '+1671', '+1684', '+1721', '+1758', '+1767', '+1784', '+1787', '+1809', '+1829', '+1849', '+1868', '+1869', '+1876', '+1939'
];

// Function to parse phone number and separate country code
const parsePhoneNumber = (phone: string): { countryCode: string; number: string } => {
  if (!phone) return { countryCode: '', number: '' };
  
  // Check if phone starts with +
  if (!phone.startsWith('+')) {
    return { countryCode: '', number: phone };
  }

  // Try to match country codes from longest to shortest (4 digits -> 1 digit)
  for (let length = 4; length >= 1; length--) {
    const potentialCode = phone.substring(0, length + 1); // +1 for the '+' sign
    if (COUNTRY_CODES.includes(potentialCode)) {
      return {
        countryCode: potentialCode,
        number: phone.substring(potentialCode.length)
      };
    }
  }

  // If no match found, try common patterns
  // Most common: 1-3 digits after +
  const match = phone.match(/^(\+\d{1,3})(.+)$/);
  if (match) {
    return {
      countryCode: match[1],
      number: match[2]
    };
  }

  // Fallback: return as is
  return { countryCode: '', number: phone };
};

export default function QuickInfoSection({ business }: Props) {
  const phoneParts = business.phone ? parsePhoneNumber(business.phone) : null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-primary" />
        Quick Info
      </h3>

      <div className="space-y-4">
        {/* Phone */}
        {business.phone && phoneParts && (
          <div className="flex items-start gap-3 group">
            <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
              <Phone className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Phone</p>
              <a
                href={`tel:${business.phone}`}
                className="text-sm font-medium text-gray-900 hover:text-primary break-all flex items-center gap-2"
              >
                {phoneParts.countryCode && (
                  <span className="font-semibold">{phoneParts.countryCode}</span>
                )}
                {phoneParts.number && (
                  <span>{phoneParts.number}</span>
                )}
                {!phoneParts.countryCode && !phoneParts.number && (
                  <span>{business.phone}</span>
                )}
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