import { useFormikContext } from 'formik';
import { Phone, Mail, MessageCircle, Globe, ChevronDown, Search } from 'lucide-react';
import { useState, useMemo, useRef, useEffect } from 'react';

// Country codes with common options (abbreviated to 3 letters)
const countryCodes = [
  { code: '+966', country: 'KSA' },
  { code: '+971', country: 'UAE' },
  { code: '+965', country: 'KUW' },
  { code: '+974', country: 'QAT' },
  { code: '+973', country: 'BHR' },
  { code: '+968', country: 'OMN' },
  { code: '+961', country: 'LBN' },
  { code: '+962', country: 'JOR' },
  { code: '+20', country: 'EGY' },
  { code: '+1', country: 'USA' },
  { code: '+44', country: 'GBR' },
  { code: '+91', country: 'IND' },
  { code: '+92', country: 'PAK' },
  { code: '+33', country: 'FRA' },
  { code: '+49', country: 'DEU' },
  { code: '+81', country: 'JPN' },
  { code: '+86', country: 'CHN' },
  { code: '+61', country: 'AUS' },
  { code: '+27', country: 'ZAF' },
  { code: '+234', country: 'NGA' },
];

export default function ContactSection() {
  const { values, errors, touched, handleChange, handleBlur, setFieldValue } = useFormikContext<any>();

  // State for country code dropdowns
  const [phoneCountrySearch, setPhoneCountrySearch] = useState('');
  const [phoneCountryOpen, setPhoneCountryOpen] = useState(false);
  const [whatsappCountrySearch, setWhatsappCountrySearch] = useState('');
  const [whatsappCountryOpen, setWhatsappCountryOpen] = useState(false);

  const phoneCountryRef = useRef<HTMLDivElement>(null);
  const phoneCountrySearchRef = useRef<HTMLInputElement>(null);
  const whatsappCountryRef = useRef<HTMLDivElement>(null);
  const whatsappCountrySearchRef = useRef<HTMLInputElement>(null);

  // Filter country codes based on search
  const filteredPhoneCountries = useMemo(() => {
    if (!phoneCountrySearch.trim()) {
      return countryCodes;
    }
    const normalizedSearch = phoneCountrySearch.toLowerCase().trim();
    return countryCodes.filter((item) => {
      const normalizedCountry = item.country.toLowerCase();
      const normalizedCode = item.code.toLowerCase();
      return (
        normalizedCountry.includes(normalizedSearch) ||
        normalizedCode.includes(normalizedSearch)
      );
    });
  }, [phoneCountrySearch]);

  const filteredWhatsappCountries = useMemo(() => {
    if (!whatsappCountrySearch.trim()) {
      return countryCodes;
    }
    const normalizedSearch = whatsappCountrySearch.toLowerCase().trim();
    return countryCodes.filter((item) => {
      const normalizedCountry = item.country.toLowerCase();
      const normalizedCode = item.code.toLowerCase();
      return (
        normalizedCountry.includes(normalizedSearch) ||
        normalizedCode.includes(normalizedSearch)
      );
    });
  }, [whatsappCountrySearch]);

  const selectedPhoneCountry = useMemo(
    () => countryCodes.find((item) => item.code === (values.phoneCountryCode || '+966')),
    [values.phoneCountryCode]
  );

  const selectedWhatsappCountry = useMemo(
    () => countryCodes.find((item) => item.code === (values.whatsappCountryCode || '+966')),
    [values.whatsappCountryCode]
  );

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (phoneCountryRef.current && !phoneCountryRef.current.contains(event.target as Node)) {
        setPhoneCountryOpen(false);
      }
      if (whatsappCountryRef.current && !whatsappCountryRef.current.contains(event.target as Node)) {
        setWhatsappCountryOpen(false);
      }
    };

    if (phoneCountryOpen || whatsappCountryOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search input when dropdown opens
      setTimeout(() => {
        if (phoneCountryOpen) phoneCountrySearchRef.current?.focus();
        if (whatsappCountryOpen) whatsappCountrySearchRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [phoneCountryOpen, whatsappCountryOpen]);

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
            <div className="relative" ref={phoneCountryRef}>
              <button
                type="button"
                onClick={() => setPhoneCountryOpen((prev) => !prev)}
                className="w-auto min-w-[100px] px-3 py-3 border-0 border-r border-gray-300 rounded-l-lg rounded-r-none h-full bg-transparent text-sm font-medium flex items-center justify-between hover:bg-gray-50"
              >
                <span className="text-xs">
                  {selectedPhoneCountry ? `${selectedPhoneCountry.code} ${selectedPhoneCountry.country}` : '+966 KSA'}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-500 ml-1" />
              </button>
              {phoneCountryOpen && (
                <div className="absolute z-50 mt-1 w-[200px] rounded-lg border border-gray-200 bg-white shadow-lg">
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
                    <Search className="h-4 w-4 text-gray-400" />
                    <input
                      ref={phoneCountrySearchRef}
                      type="text"
                      placeholder="Search country or code"
                      value={phoneCountrySearch}
                      onChange={(e) => setPhoneCountrySearch(e.target.value)}
                      className="w-full bg-transparent text-sm focus:outline-none"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredPhoneCountries.map((item) => (
                      <button
                        key={item.code}
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                        onClick={() => {
                          setFieldValue('phoneCountryCode', item.code);
                          setPhoneCountryOpen(false);
                          setPhoneCountrySearch('');
                        }}
                      >
                        <span className="text-xs">{item.code} {item.country}</span>
                      </button>
                    ))}
                    {!filteredPhoneCountries.length && (
                      <p className="px-3 py-2 text-sm text-gray-500">No results found</p>
                    )}
                  </div>
                </div>
              )}
            </div>
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
            <div className="relative" ref={whatsappCountryRef}>
              <button
                type="button"
                onClick={() => setWhatsappCountryOpen((prev) => !prev)}
                className="w-auto min-w-[100px] px-3 py-3 border-0 border-r border-gray-300 rounded-l-lg rounded-r-none h-full bg-transparent text-sm font-medium flex items-center justify-between hover:bg-gray-50"
              >
                <span className="text-xs">
                  {selectedWhatsappCountry ? `${selectedWhatsappCountry.code} ${selectedWhatsappCountry.country}` : '+966 KSA'}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-500 ml-1" />
              </button>
              {whatsappCountryOpen && (
                <div className="absolute z-50 mt-1 w-[200px] rounded-lg border border-gray-200 bg-white shadow-lg">
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
                    <Search className="h-4 w-4 text-gray-400" />
                    <input
                      ref={whatsappCountrySearchRef}
                      type="text"
                      placeholder="Search country or code"
                      value={whatsappCountrySearch}
                      onChange={(e) => setWhatsappCountrySearch(e.target.value)}
                      className="w-full bg-transparent text-sm focus:outline-none"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredWhatsappCountries.map((item) => (
                      <button
                        key={item.code}
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                        onClick={() => {
                          setFieldValue('whatsappCountryCode', item.code);
                          setWhatsappCountryOpen(false);
                          setWhatsappCountrySearch('');
                        }}
                      >
                        <span className="text-xs">{item.code} {item.country}</span>
                      </button>
                    ))}
                    {!filteredWhatsappCountries.length && (
                      <p className="px-3 py-2 text-sm text-gray-500">No results found</p>
                    )}
                  </div>
                </div>
              )}
            </div>
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