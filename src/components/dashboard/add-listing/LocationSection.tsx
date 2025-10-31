import { useFormikContext } from 'formik';
import { MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cityService } from '@/services/city.service';
import countryRegions from 'country-region-data';

export default function LocationSection() {
  const { values, errors, touched, handleChange, handleBlur, setFieldValue } = useFormikContext<any>();
  const [showCoordinates, setShowCoordinates] = useState(false);

  const { data: cities } = useQuery({
    queryKey: ['cities'],
    queryFn: () => cityService.fetchCities(),

  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-50 rounded-lg">
          <MapPin className="w-5 h-5 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Location</h2>
      </div>

      <div className="space-y-6">
        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="address"
            value={values.address}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. 202 Near house# market"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c4233] focus:border-transparent"
          />
          {touched.address && errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address as string}</p>
          )}
        </div>

        {/* City and State Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* City Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City <span className="text-red-500">*</span>
            </label>
            <select
              name="cityId"
              value={values.cityId || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c4233] focus:border-transparent"
            >
              <option value="">Select City</option>
              {cities?.map((city: any) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
            {touched.cityId && errors.cityId && (
              <p className="mt-1 text-sm text-red-600">{errors.cityId as string}</p>
            )}
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State
            </label>
            <input
              type="text"
              name="state"
              value={values.state || ''}
              onChange={handleChange}
              placeholder="State"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c4233] focus:border-transparent"
            />
          </div>
        </div>

        {/* CR Number (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CR Number (Commercial Registration)
          </label>
          <input
            type="text"
            name="crNumber"
            value={values.crNumber || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="1234567890"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c4233] focus:border-transparent"
          />
          <p className="mt-1 text-sm text-gray-500">Optional - helps verify your business</p>
        </div>

        {/* Coordinates Toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowCoordinates(!showCoordinates)}
            className="flex items-center gap-2 text-sm font-medium text-[#1c4233] hover:text-[#245240]"
          >
            {showCoordinates ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            Add GPS Coordinates (Optional)
          </button>
        </div>

        {/* Coordinates Fields */}
        {showCoordinates && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                name="latitude"
                value={values.latitude || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="24.7136"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c4233] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                name="longitude"
                value={values.longitude || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="46.6753"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c4233] focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}