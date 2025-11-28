import { useFormikContext } from 'formik';
import { Phone, Mail, MessageCircle, Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Country codes with common options
const countryCodes = [
  { code: '+966', country: 'Saudi Arabia' },
  { code: '+971', country: 'UAE' },
  { code: '+965', country: 'Kuwait' },
  { code: '+974', country: 'Qatar' },
  { code: '+973', country: 'Bahrain' },
  { code: '+968', country: 'Oman' },
  { code: '+961', country: 'Lebanon' },
  { code: '+962', country: 'Jordan' },
  { code: '+20', country: 'Egypt' },
  { code: '+1', country: 'USA/Canada' },
  { code: '+44', country: 'UK' },
  { code: '+91', country: 'India' },
  { code: '+92', country: 'Pakistan' },
  { code: '+33', country: 'France' },
  { code: '+49', country: 'Germany' },
  { code: '+81', country: 'Japan' },
  { code: '+86', country: 'China' },
  { code: '+61', country: 'Australia' },
  { code: '+27', country: 'South Africa' },
  { code: '+234', country: 'Nigeria' },
];

export default function ContactSection() {
  const { values, errors, touched, handleChange, handleBlur, setFieldValue } = useFormikContext<any>();

  // Handle phone number input - only allow digits with length validation
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove all non-digits
    if (value.length <= 15) {
      setFieldValue('phone', value);
    }
  };

  // Handle WhatsApp number input - only allow digits with length validation
  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove all non-digits
    if (value.length <= 15) {
      setFieldValue('whatsapp', value);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Phone className="w-5 h-5 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Contact Information</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="w-4 h-4 inline mr-1" />
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="contact@business.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c4233] focus:border-transparent"
          />
          {touched.email && errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email as string}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4 inline mr-1" />
            Phone <span className="text-red-500">*</span>
          </label>
          <div className={`relative flex items-center border rounded-lg focus-within:ring-2 focus-within:ring-[#1c4233] focus-within:border-transparent ${
            touched.phone && errors.phone ? 'border-red-500' : 'border-gray-300'
          }`}>
            <Select
              value={values.phoneCountryCode || '+966'}
              onValueChange={(value) => setFieldValue('phoneCountryCode', value)}
            >
              <SelectTrigger className="w-auto min-w-[80px] border-0 border-r border-gray-300 rounded-l-lg rounded-r-none h-full focus:ring-0 focus:border-gray-300 bg-transparent [&_svg]:hidden">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {countryCodes.map((item) => (
                  <SelectItem key={item.code} value={item.code}>
                    {item.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input
              type="tel"
              name="phone"
              value={values.phone}
              onChange={handlePhoneChange}
              onBlur={handleBlur}
              placeholder="Enter 9-15 digits"
              maxLength={15}
              className="flex-1 px-4 py-3 border-0 rounded-r-lg focus:ring-0 focus:outline-none"
            />
          </div>
          {touched.phone && errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone as string}</p>
          )}
          {touched.phoneCountryCode && errors.phoneCountryCode && (
            <p className="mt-1 text-sm text-red-600">{errors.phoneCountryCode as string}</p>
          )}
          {!errors.phone && values.phone && (
            <p className="mt-1 text-xs text-gray-500">
              {values.phone.length} digit{values.phone.length !== 1 ? 's' : ''} (9-15 required)
            </p>
          )}
        </div>

        {/* WhatsApp */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MessageCircle className="w-4 h-4 inline mr-1" />
            WhatsApp
          </label>
          <div className={`relative flex items-center border rounded-lg focus-within:ring-2 focus-within:ring-[#1c4233] focus-within:border-transparent ${
            touched.whatsapp && errors.whatsapp ? 'border-red-500' : 'border-gray-300'
          }`}>
            <Select
              value={values.whatsappCountryCode || '+966'}
              onValueChange={(value) => setFieldValue('whatsappCountryCode', value)}
            >
              <SelectTrigger className="w-auto min-w-[80px] border-0 border-r border-gray-300 rounded-l-lg rounded-r-none h-full focus:ring-0 focus:border-gray-300 bg-transparent [&_svg]:hidden">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {countryCodes.map((item) => (
                  <SelectItem key={item.code} value={item.code}>
                    {item.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input
              type="tel"
              name="whatsapp"
              value={values.whatsapp}
              onChange={handleWhatsAppChange}
              onBlur={handleBlur}
              placeholder="Enter 9-15 digits (optional)"
              maxLength={15}
              className="flex-1 px-4 py-3 border-0 rounded-r-lg focus:ring-0 focus:outline-none"
            />
          </div>
          {touched.whatsapp && errors.whatsapp && (
            <p className="mt-1 text-sm text-red-600">{errors.whatsapp as string}</p>
          )}
          {touched.whatsappCountryCode && errors.whatsappCountryCode && (
            <p className="mt-1 text-sm text-red-600">{errors.whatsappCountryCode as string}</p>
          )}
          {!errors.whatsapp && values.whatsapp && (
            <p className="mt-1 text-xs text-gray-500">
              {values.whatsapp.length} digit{values.whatsapp.length !== 1 ? 's' : ''} (9-15 required)
            </p>
          )}
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Globe className="w-4 h-4 inline mr-1" />
            Website
          </label>
          <input
            type="url"
            name="website"
            value={values.website}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="https://yourwebsite.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c4233] focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}